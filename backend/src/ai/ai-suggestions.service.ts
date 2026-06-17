import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { FoodStatus } from "@prisma/client";

import { AI_MODEL_PROVIDER } from "./ai.tokens";
import type { CreateMealIdeasSuggestionDto } from "./dto/create-meal-ideas-suggestion.dto";
import type { AiModelProvider, AiModelPrompt } from "./types/ai-model";
import type {
  AiConfiguration,
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

    return {
      context: summary,
      model: completion.model,
      provider: completion.provider,
      // Future providers should return JSON matching AiMealIdeaSuggestion[].
      suggestions: [],
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
      system: [
        "Eres un asistente de sugerencias de comida para una app de IMO/SIBO.",
        "Usa solo alimentos seguros o razonables del contexto recibido.",
        "Devuelve propuestas prudentes y faciles de revisar por el usuario.",
      ].join("\n"),
      user: JSON.stringify(
        {
          avoidedTags: createMealIdeasSuggestionDto.avoidedTags ?? [],
          context,
          limit,
          notes: createMealIdeasSuggestionDto.notes?.trim() || undefined,
          preferredTags: createMealIdeasSuggestionDto.preferredTags ?? [],
          responseFormat: {
            items: ["string"],
            reason: "string",
            tags: ["string"],
            title: "string",
          },
        },
        null,
        2,
      ),
    };
  }
}
