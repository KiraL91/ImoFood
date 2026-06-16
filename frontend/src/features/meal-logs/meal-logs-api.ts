import { apiClient } from "@/lib/api/client";
import { mealLogSchema, type MealLog } from "@/lib/types/meal-log";

export type CreateMealLogInput = {
  consumedAt: string;
  description: string;
  foodIds?: string[];
  notes?: string;
  recipeId?: string | null;
};

export type UpdateMealLogInput = Partial<CreateMealLogInput>;

export async function getMealLogs(): Promise<MealLog[]> {
  const data = await apiClient<unknown>("/meal-logs");

  return mealLogSchema.array().parse(data);
}

export async function createMealLog(input: CreateMealLogInput): Promise<MealLog> {
  const data = await apiClient<unknown>("/meal-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return mealLogSchema.parse(data);
}

export async function updateMealLog({
  id,
  input,
}: {
  id: string;
  input: UpdateMealLogInput;
}): Promise<MealLog> {
  const data = await apiClient<unknown>(`/meal-logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return mealLogSchema.parse(data);
}

export async function deleteMealLog(id: string): Promise<void> {
  await apiClient<void>(`/meal-logs/${id}`, {
    method: "DELETE",
  });
}
