import { z } from "zod";

export const mealLogSchema = z.object({
  id: z.string(),
  consumedAt: z.string(),
  description: z.string(),
  recipeId: z.string().optional(),
  foodIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MealLog = z.infer<typeof mealLogSchema>;
