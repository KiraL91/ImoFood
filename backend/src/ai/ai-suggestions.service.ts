import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { FoodStatus } from "@prisma/client";

import { AI_MODEL_PROVIDER } from "./ai.tokens";
import type { CreateMealIdeasSuggestionDto } from "./dto/create-meal-ideas-suggestion.dto";
import { mealIdeasResponseSchema } from "./schemas/meal-ideas-response.schema";
import type { AiModelProvider, AiModelPrompt } from "./types/ai-model";
import type {
  AiConfiguration,
  AiMealIdeaSuggestion,
  AiMealIdeasContextSummary,
  AiMealIdeasSuggestionResult,
} from "./types/meal-idea-suggestion";
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
      capabilities: ["meal-ideas"],
      enabled,
      model: this.modelProvider.modelName,
      provider: this.modelProvider.providerName,
      status: enabled ? "ready" : "disabled",
    };
  }

  async generateMealIdeas(
    createMealIdeasSuggestionDto: CreateMealIdeasSuggestionDto,
  ): Promise<AiMealIdeasSuggestionResult> {
    const context = await this.getMealIdeasContext(
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

  private async getMealIdeasContext(
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
            status: FoodStatus.allowed,
            tolerance: {
              gte: 4,
            },
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
              in: [FoodStatus.allowed, FoodStatus.testing],
            },
            tolerance: {
              gte: 3,
            },
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
                  in: [FoodStatus.avoid, FoodStatus.caution],
                },
              },
              {
                tolerance: {
                  lt: 3,
                },
              },
            ],
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

    return {
      metadata: {
        capability: "meal-ideas",
        limit,
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
        "No des consejo medico ni afirmes que una comida es universalmente segura.",
        "Devuelve exclusivamente JSON valido con la clave suggestions.",
      ].join("\n"),
      user: JSON.stringify(
        {
          avoidedTags: createMealIdeasSuggestionDto.avoidedTags ?? [],
          context: {
            highRatedRecipes: context.highRatedRecipes,
            reasonableFoods: context.reasonableFoods,
            safeFoods: context.safeFoods,
          },
          limit,
          notes: createMealIdeasSuggestionDto.notes?.trim() || undefined,
          preferredTags: createMealIdeasSuggestionDto.preferredTags ?? [],
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
