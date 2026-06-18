import { z } from "zod";

import { apiClient } from "@/lib/api/client";

export type GenerateAiMealIdeasInput = {
  avoidedTags?: string[];
  foodIds?: string[];
  goal?: "balanced" | "quick" | "gentle" | "filling" | "low-risk" | "use-leftovers";
  limit?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  notes?: string;
  preferredTags?: string[];
  variationSeed?: string;
};

const aiConfigurationSchema = z.object({
  capabilities: z.array(z.string()),
  enabled: z.boolean(),
  model: z.string(),
  provider: z.string(),
  status: z.enum(["disabled", "ready"]),
});

const aiMealIdeaSuggestionSchema = z.object({
  foodNames: z.array(z.string()).default([]),
  items: z.array(z.string()),
  reason: z.string().optional(),
  tags: z.array(z.string()),
  title: z.string(),
});

const aiMealIdeasSuggestionResultSchema = z.object({
  context: z.object({
    highRatedRecipesCount: z.number(),
    reasonableFoodsCount: z.number(),
    safeFoodsCount: z.number(),
  }),
  model: z.string(),
  provider: z.string(),
  suggestions: z.array(aiMealIdeaSuggestionSchema),
});

export type AiConfiguration = z.infer<typeof aiConfigurationSchema>;
export type AiMealIdeaSuggestion = z.infer<typeof aiMealIdeaSuggestionSchema>;
export type AiMealIdeasSuggestionResult = z.infer<
  typeof aiMealIdeasSuggestionResultSchema
>;

export async function getAiSuggestionsConfig(): Promise<AiConfiguration> {
  const data = await apiClient<unknown>("/ai/suggestions/config");

  return aiConfigurationSchema.parse(data);
}

export async function generateAiMealIdeas(
  input: GenerateAiMealIdeasInput,
): Promise<AiMealIdeasSuggestionResult> {
  const data = await apiClient<unknown>("/ai/suggestions/meal-ideas", {
    body: JSON.stringify(input),
    method: "POST",
  });

  return aiMealIdeasSuggestionResultSchema.parse(data);
}
