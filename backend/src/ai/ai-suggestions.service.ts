import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { FoodStatus as PrismaFoodStatus } from "@prisma/client";

import { AI_MODEL_PROVIDER } from "./ai.tokens";
import type { CreateFoodInfoSuggestionDto } from "./dto/create-food-info-suggestion.dto";
import type { CreateMealIdeasSuggestionDto } from "./dto/create-meal-ideas-suggestion.dto";
import { foodInfoResponseSchema } from "./schemas/food-info-response.schema";
import { mealIdeasResponseSchema } from "./schemas/meal-ideas-response.schema";
import type { AiModelProvider, AiModelPrompt } from "./types/ai-model";
import type {
  AiFoodInfoSuggestion,
  AiFoodInfoSuggestionResult,
} from "./types/food-info-suggestion";
import type {
  AiConfiguration,
  AiMealIdeaSuggestion,
  AiMealIdeasContextSummary,
  AiMealIdeasSuggestionResult,
} from "./types/meal-idea-suggestion";
import {
  FOOD_STATUSES,
  type FoodStatus,
  type ToleranceScore,
} from "../foods/types/food";
import { PrismaService } from "../prisma/prisma.service";

type MealIdeasContext = {
  blockedFoods: Array<{
    name: string;
  }>;
  highRatedRecipes: Array<{
    ingredients: string[];
    name: string;
    rating: number | null;
    tags: string[];
  }>;
  reasonableFoods: Array<{
    id: string;
    name: string;
    status: string;
    suggestedServing: string | null;
    tags: string[];
    tolerance: number;
  }>;
  safeFoods: Array<{
    id: string;
    name: string;
    suggestedServing: string | null;
    tags: string[];
    tolerance: number;
  }>;
};

type FoodInfoContext = {
  categories: string[];
  existingFoods: Array<{
    category: string;
    name: string;
    status: string;
    tags: string[];
    tolerance: number;
  }>;
  tags: string[];
};

@Injectable()
export class AiSuggestionsService {
  constructor(
    @Inject(AI_MODEL_PROVIDER)
    private readonly modelProvider: AiModelProvider,
    private readonly prisma: PrismaService,
  ) {}

  getConfiguration(): AiConfiguration {
    const enabled = this.modelProvider.isEnabled();

    return {
      capabilities: ["meal-ideas", "food-info"],
      enabled,
      model: this.modelProvider.modelName,
      provider: this.modelProvider.providerName,
      status: enabled ? "ready" : "disabled",
    };
  }

  async generateMealIdeas(
    createMealIdeasSuggestionDto: CreateMealIdeasSuggestionDto,
    userId: string,
  ): Promise<AiMealIdeasSuggestionResult> {
    const context = await this.getMealIdeasContext(
      userId,
      createMealIdeasSuggestionDto.foodIds,
    );
    const summary = this.getContextSummary(context);

    if (!this.modelProvider.isEnabled()) {
      throw new ServiceUnavailableException(
        "AI meal suggestions are not configured yet.",
      );
    }

    const prompt = this.buildMealIdeasPrompt(
      createMealIdeasSuggestionDto,
      context,
    );
    const completion = await this.modelProvider.complete(prompt);
    const suggestions = this.parseMealIdeasSuggestions(
      completion.content,
      createMealIdeasSuggestionDto.limit ?? 3,
      context,
    );

    return {
      context: summary,
      model: completion.model,
      provider: completion.provider,
      suggestions,
    };
  }

  async generateFoodInfo(
    createFoodInfoSuggestionDto: CreateFoodInfoSuggestionDto,
    userId: string,
  ): Promise<AiFoodInfoSuggestionResult> {
    if (createFoodInfoSuggestionDto.name.trim().length < 2) {
      throw new BadRequestException("Food name is required.");
    }

    if (!this.modelProvider.isEnabled()) {
      throw new ServiceUnavailableException(
        "AI food suggestions are not configured yet.",
      );
    }

    const context = await this.getFoodInfoContext(userId);
    const prompt = this.buildFoodInfoPrompt(
      createFoodInfoSuggestionDto,
      context,
    );
    const completion = await this.modelProvider.complete(prompt);
    const suggestion = this.parseFoodInfoSuggestion(completion.content);

    return {
      model: completion.model,
      provider: completion.provider,
      suggestion,
    };
  }

  private async getMealIdeasContext(
    userId: string,
    foodIds?: string[],
  ): Promise<MealIdeasContext> {
    const selectedFoodIds = this.normalizeFoodIds(foodIds);
    const hasSelectedFoods = selectedFoodIds.length > 0;
    const selectedFoodWhere = hasSelectedFoods
      ? {
          id: {
            in: selectedFoodIds,
          },
        }
      : {};
    const [safeFoods, reasonableFoods, blockedFoods, highRatedRecipes] =
      await Promise.all([
        this.prisma.food.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            suggestedServing: true,
            tags: true,
            tolerance: true,
          },
          where: {
            ...selectedFoodWhere,
            status: PrismaFoodStatus.allowed,
            tolerance: {
              gte: 4,
            },
            userId,
          },
        }),
        this.prisma.food.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            status: true,
            suggestedServing: true,
            tags: true,
            tolerance: true,
          },
          where: {
            ...selectedFoodWhere,
            status: {
              in: [PrismaFoodStatus.allowed, PrismaFoodStatus.testing],
            },
            tolerance: {
              gte: 3,
            },
            userId,
          },
        }),
        this.prisma.food.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            name: true,
          },
          where: {
            OR: [
              {
                status: {
                  in: [PrismaFoodStatus.avoid, PrismaFoodStatus.caution],
                },
              },
              {
                tolerance: {
                  lt: 3,
                },
              },
            ],
            userId,
          },
        }),
        this.prisma.recipe.findMany({
          orderBy: {
            name: "asc",
          },
          select: {
            ingredients: true,
            name: true,
            rating: true,
            tags: true,
          },
          where: {
            rating: {
              gte: 4,
            },
            userId,
          },
        }),
      ]);

    if (hasSelectedFoods && reasonableFoods.length === 0) {
      throw new BadRequestException(
        "Selected foods do not include any allowed or testing food with enough tolerance.",
      );
    }

    return {
      blockedFoods,
      highRatedRecipes,
      reasonableFoods,
      safeFoods,
    };
  }

  private async getFoodInfoContext(userId: string): Promise<FoodInfoContext> {
    const foods = await this.prisma.food.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        category: true,
        name: true,
        status: true,
        tags: true,
        tolerance: true,
      },
      take: 120,
      where: {
        userId,
      },
    });
    const categories = Array.from(
      new Set(
        foods
          .map((food) => food.category.trim())
          .filter((category) => category.length > 0),
      ),
    ).sort((leftCategory, rightCategory) =>
      leftCategory.localeCompare(rightCategory, "es"),
    );
    const tags = Array.from(
      new Set(
        foods
          .flatMap((food) => food.tags)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      ),
    ).sort((leftTag, rightTag) => leftTag.localeCompare(rightTag, "es"));

    return {
      categories,
      existingFoods: foods,
      tags,
    };
  }

  private getContextSummary(
    context: MealIdeasContext,
  ): AiMealIdeasContextSummary {
    return {
      highRatedRecipesCount: context.highRatedRecipes.length,
      reasonableFoodsCount: context.reasonableFoods.length,
      safeFoodsCount: context.safeFoods.length,
    };
  }

  private buildMealIdeasPrompt(
    createMealIdeasSuggestionDto: CreateMealIdeasSuggestionDto,
    context: MealIdeasContext,
  ): AiModelPrompt {
    const limit = createMealIdeasSuggestionDto.limit ?? 3;
    const variationSeed =
      createMealIdeasSuggestionDto.variationSeed?.trim() || undefined;
    const promptContext = this.getPromptContext(context, variationSeed);

    return {
      metadata: {
        capability: "meal-ideas",
        goal: createMealIdeasSuggestionDto.goal,
        limit,
        mealType: createMealIdeasSuggestionDto.mealType,
        variationSeed,
      },
      responseFormat: {
        mimeType: "application/json",
        schema: mealIdeasResponseSchema,
      },
      system: [
        "Eres un asistente de sugerencias de comida para una app de IMO/SIBO.",
        "Usa solo alimentos seguros o razonables del contexto recibido.",
        "No inventes alimentos que no existan en el contexto.",
        "No uses alimentos marcados como evitados por tags.",
        "Devuelve propuestas prudentes y faciles de revisar por el usuario.",
        "Genera variedad real entre propuestas: cambia combinaciones, formato y preparacion cuando sea posible.",
        "Si recibes una semilla de variacion, usala solo para proponer alternativas diferentes, no para inventar alimentos.",
        "No des consejo medico ni afirmes que una comida es universalmente segura.",
        "Devuelve exclusivamente JSON valido con la clave suggestions.",
      ].join("\n"),
      user: JSON.stringify(
        {
          avoidedTags: createMealIdeasSuggestionDto.avoidedTags ?? [],
          context: {
            highRatedRecipes: promptContext.highRatedRecipes,
            reasonableFoods: promptContext.reasonableFoods,
            safeFoods: promptContext.safeFoods,
          },
          goal: createMealIdeasSuggestionDto.goal ?? "balanced",
          limit,
          mealType: createMealIdeasSuggestionDto.mealType ?? "any",
          notes: createMealIdeasSuggestionDto.notes?.trim() || undefined,
          preferredTags: createMealIdeasSuggestionDto.preferredTags ?? [],
          variationGuidance: {
            avoidRepeatingObviousTopCombinations: true,
            seed: variationSeed,
            useDifferentFoodCombinationsAcrossSuggestions: true,
          },
          responseFormat: {
            suggestions: [
              {
                foodNames: [
                  "exact food names copied from context.reasonableFoods or context.safeFoods",
                ],
                items: ["string"],
                reason: "string",
                tags: ["string"],
                title: "string",
              },
            ],
          },
        },
        null,
        2,
      ),
    };
  }

  private buildFoodInfoPrompt(
    createFoodInfoSuggestionDto: CreateFoodInfoSuggestionDto,
    context: FoodInfoContext,
  ): AiModelPrompt {
    const name = createFoodInfoSuggestionDto.name.trim();

    return {
      metadata: {
        capability: "food-info",
        foodName: name,
      },
      responseFormat: {
        mimeType: "application/json",
        schema: foodInfoResponseSchema,
      },
      system: [
        "Eres un asistente para una app de seguimiento alimentario relacionada con IMO, SIBO e IBD.",
        "Tu tarea es proponer metadatos iniciales para un alimento que el usuario quiere guardar.",
        "La propuesta debe ser prudente, editable y orientativa; no des consejo medico.",
        "Si hay incertidumbre sobre tolerancia, usa testing o caution antes que allowed.",
        "La racion sugerida debe incluir una cantidad aproximada y una equivalencia cotidiana breve.",
        "Devuelve exclusivamente JSON valido con la clave suggestion.",
      ].join("\n"),
      user: JSON.stringify(
        {
          context: {
            existingCategories: context.categories.slice(0, 40),
            existingFoods: context.existingFoods.slice(0, 60),
            existingTags: context.tags.slice(0, 60),
          },
          partialInput: {
            category: createFoodInfoSuggestionDto.category?.trim() || undefined,
            notes: createFoodInfoSuggestionDto.notes?.trim() || undefined,
            tags: createFoodInfoSuggestionDto.tags ?? [],
          },
          responseFormat: {
            suggestion: {
              category: "string",
              notes:
                "breve explicacion sobre tolerancia tipica, variabilidad y cautelas",
              status: "allowed | testing | caution | avoid",
              suggestedServing:
                "cantidad aproximada + equivalencia, por ejemplo: 50 g, equivale a medio aguacate mediano",
              tags: ["string"],
              tolerance: "integer from 1 to 5",
            },
          },
          rules: {
            allowedStatuses: FOOD_STATUSES,
            maxTags: 6,
            toleranceScale:
              "1 muy mala, 2 baja, 3 media/en prueba, 4 buena, 5 muy buena",
          },
          targetFoodName: name,
        },
        null,
        2,
      ),
    };
  }

  private getPromptContext(
    context: MealIdeasContext,
    variationSeed?: string,
  ): Omit<MealIdeasContext, "blockedFoods"> {
    return {
      highRatedRecipes: this.orderForPrompt(
        context.highRatedRecipes,
        variationSeed,
        "recipes",
      ),
      reasonableFoods: this.orderForPrompt(
        context.reasonableFoods,
        variationSeed,
        "reasonable-foods",
      ),
      safeFoods: this.orderForPrompt(
        context.safeFoods,
        variationSeed,
        "safe-foods",
      ),
    };
  }

  private orderForPrompt<T>(
    items: T[],
    variationSeed?: string,
    scope = "",
  ): T[] {
    if (!variationSeed || items.length <= 1) {
      return items;
    }

    const offset = this.getStableOffset(
      `${variationSeed}:${scope}`,
      items.length,
    );

    return [...items.slice(offset), ...items.slice(0, offset)];
  }

  private getStableOffset(value: string, modulo: number): number {
    let hash = 0;

    for (const character of value) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    return hash % modulo;
  }

  private parseMealIdeasSuggestions(
    content: string,
    limit: number,
    context: MealIdeasContext,
  ): AiMealIdeaSuggestion[] {
    const parsedContent = this.parseJsonContent(content);
    const suggestions = this.readSuggestions(parsedContent);

    if (suggestions.length === 0) {
      throw new BadGatewayException(
        "AI response did not include meal suggestions.",
      );
    }

    const parsedSuggestions = suggestions
      .slice(0, limit)
      .map((suggestion) => this.toMealIdeaSuggestion(suggestion));

    this.assertSuggestedFoodsAreAllowed(parsedSuggestions, context);

    return parsedSuggestions;
  }

  private parseFoodInfoSuggestion(content: string): AiFoodInfoSuggestion {
    const parsedContent = this.parseJsonContent(content);

    if (
      !this.isRecord(parsedContent) ||
      !this.isRecord(parsedContent.suggestion)
    ) {
      throw new BadGatewayException(
        "AI response did not include a food suggestion.",
      );
    }

    const suggestion = parsedContent.suggestion;
    const category = this.readRequiredString(suggestion.category, "category");
    const status = this.readFoodStatus(suggestion.status);
    const tolerance = this.readToleranceScore(suggestion.tolerance);
    const suggestedServing = this.readRequiredString(
      suggestion.suggestedServing,
      "suggestedServing",
    );
    const tags = this.readStringList(suggestion.tags, "tags").slice(0, 6);
    const notes = this.readOptionalString(suggestion.notes);

    if (tags.length === 0) {
      throw new BadGatewayException("AI suggestion did not include tags.");
    }

    return {
      category,
      notes,
      status,
      suggestedServing,
      tags,
      tolerance,
    };
  }

  private parseJsonContent(content: string): unknown {
    const normalizedContent = content
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(normalizedContent) as unknown;
    } catch {
      throw new BadGatewayException("AI response was not valid JSON.");
    }
  }

  private readSuggestions(content: unknown): unknown[] {
    if (!this.isRecord(content) || !Array.isArray(content.suggestions)) {
      throw new BadGatewayException(
        "AI response did not match the expected schema.",
      );
    }

    return content.suggestions;
  }

  private toMealIdeaSuggestion(suggestion: unknown): AiMealIdeaSuggestion {
    if (!this.isRecord(suggestion)) {
      throw new BadGatewayException("AI suggestion was not an object.");
    }

    const title = this.readRequiredString(suggestion.title, "title");
    const foodNames = this.readStringList(suggestion.foodNames, "foodNames");
    const items = this.readStringList(suggestion.items, "items");
    const tags = this.readStringList(suggestion.tags, "tags");
    const reason = this.readOptionalString(suggestion.reason);

    if (items.length === 0) {
      throw new BadGatewayException("AI suggestion did not include items.");
    }

    return {
      foodNames,
      items,
      reason,
      tags,
      title,
    };
  }

  private readRequiredString(value: unknown, field: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new BadGatewayException(
        `AI suggestion field "${field}" was invalid.`,
      );
    }

    return value.trim();
  }

  private readOptionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      throw new BadGatewayException("AI suggestion reason was invalid.");
    }

    return value.trim() || undefined;
  }

  private readStringList(value: unknown, field: string): string[] {
    if (!Array.isArray(value)) {
      throw new BadGatewayException(
        `AI suggestion field "${field}" was invalid.`,
      );
    }

    return Array.from(
      new Set(
        value
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    );
  }

  private readFoodStatus(value: unknown): FoodStatus {
    if (
      typeof value !== "string" ||
      !FOOD_STATUSES.includes(value as FoodStatus)
    ) {
      throw new BadGatewayException("AI food status was invalid.");
    }

    return value as FoodStatus;
  }

  private readToleranceScore(value: unknown): ToleranceScore {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (
      typeof parsedValue !== "number" ||
      !Number.isInteger(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 5
    ) {
      throw new BadGatewayException("AI food tolerance was invalid.");
    }

    return parsedValue as ToleranceScore;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private assertSuggestedFoodsAreAllowed(
    suggestions: AiMealIdeaSuggestion[],
    context: MealIdeasContext,
  ): void {
    const allowedFoods = this.buildFoodLookup([
      ...context.safeFoods.map((food) => food.name),
      ...context.reasonableFoods.map((food) => food.name),
    ]);
    const blockedFoodNames = context.blockedFoods
      .map((food) => food.name)
      .filter((name) => this.normalizeFoodName(name).length >= 3);

    suggestions.forEach((suggestion) => {
      if (suggestion.foodNames.length === 0) {
        throw new BadGatewayException(
          "AI suggestion did not include suggested food names.",
        );
      }

      const validatedFoodNames = suggestion.foodNames.map((foodName) => {
        const normalizedFoodName = this.normalizeFoodName(foodName);
        const allowedFoodName = allowedFoods.get(normalizedFoodName);

        if (!allowedFoodName) {
          throw new BadGatewayException(
            `AI suggestion included a food outside the allowed context: "${foodName}".`,
          );
        }

        return allowedFoodName;
      });

      suggestion.foodNames = Array.from(new Set(validatedFoodNames));

      const suggestionText = this.normalizeFoodName(
        [
          suggestion.title,
          ...suggestion.items,
          suggestion.reason ?? "",
          ...suggestion.tags,
        ].join(" "),
      );

      blockedFoodNames.forEach((foodName) => {
        const normalizedFoodName = this.normalizeFoodName(foodName);

        if (this.containsFoodName(suggestionText, normalizedFoodName)) {
          throw new BadGatewayException(
            `AI suggestion mentioned a blocked food: "${foodName}".`,
          );
        }
      });
    });
  }

  private buildFoodLookup(foodNames: string[]): Map<string, string> {
    return new Map(
      foodNames.map((foodName) => [
        this.normalizeFoodName(foodName),
        foodName.trim(),
      ]),
    );
  }

  private containsFoodName(text: string, foodName: string): boolean {
    const escapedFoodName = foodName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const foodNamePattern = new RegExp(
      `(^|[^a-z0-9])${escapedFoodName}([^a-z0-9]|$)`,
    );

    return foodNamePattern.test(text);
  }

  private normalizeFoodName(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  private normalizeFoodIds(foodIds?: string[]): string[] {
    return Array.from(
      new Set(
        (foodIds ?? [])
          .map((foodId) => foodId.trim())
          .filter((foodId) => foodId.length > 0),
      ),
    );
  }
}
