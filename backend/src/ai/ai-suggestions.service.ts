import {
  BadGatewayException,
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
  highRatedRecipes: Array<{
    ingredients: string[];
    name: string;
    rating: number | null;
    tags: string[];
  }>;
  reasonableFoods: Array<{
    name: string;
    status: string;
    suggestedServing: string | null;
    tags: string[];
    tolerance: number;
  }>;
  safeFoods: Array<{
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
    const context = await this.getMealIdeasContext();
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
    );

    return {
      context: summary,
      model: completion.model,
      provider: completion.provider,
      suggestions,
    };
  }

  private async getMealIdeasContext(): Promise<MealIdeasContext> {
    const [safeFoods, reasonableFoods, highRatedRecipes] = await Promise.all([
      this.prisma.food.findMany({
        orderBy: {
          name: "asc",
        },
        select: {
          name: true,
          suggestedServing: true,
          tags: true,
          tolerance: true,
        },
        where: {
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
          name: true,
          status: true,
          suggestedServing: true,
          tags: true,
          tolerance: true,
        },
        where: {
          status: {
            in: [FoodStatus.allowed, FoodStatus.testing],
          },
          tolerance: {
            gte: 3,
          },
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

    return {
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
          context,
          limit,
          notes: createMealIdeasSuggestionDto.notes?.trim() || undefined,
          preferredTags: createMealIdeasSuggestionDto.preferredTags ?? [],
          responseFormat: {
            suggestions: [
              {
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
  ): AiMealIdeaSuggestion[] {
    const parsedContent = this.parseJsonContent(content);
    const suggestions = this.readSuggestions(parsedContent);

    if (suggestions.length === 0) {
      throw new BadGatewayException(
        "AI response did not include meal suggestions.",
      );
    }

    return suggestions
      .slice(0, limit)
      .map((suggestion) => this.toMealIdeaSuggestion(suggestion));
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
    const items = this.readStringList(suggestion.items, "items");
    const tags = this.readStringList(suggestion.tags, "tags");
    const reason = this.readOptionalString(suggestion.reason);

    if (items.length === 0) {
      throw new BadGatewayException("AI suggestion did not include items.");
    }

    return {
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
}
