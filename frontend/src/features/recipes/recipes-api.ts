import { apiClient } from "@/lib/api/client";
import { recipeSchema, type Recipe, type RecipeRatingValue } from "@/lib/types/recipe";

export type RecipeFilters = {
  ingredient?: string;
  minRating?: RecipeRatingValue;
  search?: string;
  tag?: string;
};

export type CreateRecipeInput = {
  name: string;
  description?: string;
  ingredients: string[];
  steps?: string[];
  tags: string[];
  prepTimeMinutes: number;
  rating?: RecipeRatingValue;
};

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

function buildRecipeSearchParams(filters: RecipeFilters = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getRecipes(filters?: RecipeFilters): Promise<Recipe[]> {
  const data = await apiClient<unknown>(`/recipes${buildRecipeSearchParams(filters)}`);

  return recipeSchema.array().parse(data);
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const data = await apiClient<unknown>("/recipes", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return recipeSchema.parse(data);
}

export async function updateRecipe({
  id,
  input,
}: {
  id: string;
  input: UpdateRecipeInput;
}): Promise<Recipe> {
  const data = await apiClient<unknown>(`/recipes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return recipeSchema.parse(data);
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient<void>(`/recipes/${id}`, {
    method: "DELETE",
  });
}
