import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import {
  foodSchema,
  foodStatusSchema,
  toleranceSchema,
  type Food,
  type FoodStatus,
} from "@/lib/types/food";

export type FoodFilters = {
  search?: string;
  status?: FoodStatus;
  category?: string;
  tag?: string;
};

export type CreateFoodInput = {
  name: string;
  category: string;
  status: FoodStatus;
  tolerance: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  suggestedServing?: string;
  tags: string[];
};

export type UpdateFoodInput = Partial<CreateFoodInput>;

export type UpdateFoodPreferenceInput = Partial<
  Pick<CreateFoodInput, "notes" | "status" | "tolerance">
>;

export type SuggestFoodInfoInput = {
  category?: string;
  name: string;
  notes?: string;
  tags?: string[];
};

const aiFoodInfoSuggestionSchema = z.object({
  category: z.string(),
  notes: z.string().optional(),
  status: foodStatusSchema,
  suggestedServing: z.string(),
  tags: z.array(z.string()),
  tolerance: toleranceSchema,
});

const aiFoodInfoSuggestionResultSchema = z.object({
  model: z.string(),
  provider: z.string(),
  suggestion: aiFoodInfoSuggestionSchema,
});

export type AiFoodInfoSuggestion = z.infer<typeof aiFoodInfoSuggestionSchema>;

function buildFoodSearchParams(filters: FoodFilters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getFoods(filters?: FoodFilters): Promise<Food[]> {
  const data = await apiClient<unknown>(`/foods${buildFoodSearchParams(filters)}`);

  return foodSchema.array().parse(data);
}

export async function createFood(input: CreateFoodInput): Promise<Food> {
  const data = await apiClient<unknown>("/foods", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return foodSchema.parse(data);
}

export async function updateFood({
  id,
  input,
}: {
  id: string;
  input: UpdateFoodInput;
}): Promise<Food> {
  const data = await apiClient<unknown>(`/foods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return foodSchema.parse(data);
}

export async function updateFoodPreference({
  id,
  input,
}: {
  id: string;
  input: UpdateFoodPreferenceInput;
}): Promise<Food> {
  const data = await apiClient<unknown>(`/foods/${id}/preference`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return foodSchema.parse(data);
}

export async function deleteFood(id: string): Promise<void> {
  await apiClient<void>(`/foods/${id}`, {
    method: "DELETE",
  });
}

export async function suggestFoodInfo(
  input: SuggestFoodInfoInput,
): Promise<AiFoodInfoSuggestion> {
  const data = await apiClient<unknown>("/ai/suggestions/food-info", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return aiFoodInfoSuggestionResultSchema.parse(data).suggestion;
}
