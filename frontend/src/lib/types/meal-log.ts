import { z } from "zod";

export const mealLogSchema = z.object({
  id: z.string(),
  consumedAt: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  recipeId: z.string().optional(),
  recipe: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MealLog = z.infer<typeof mealLogSchema>;
