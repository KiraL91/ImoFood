import { z } from "zod";
import { foodStatusSchema } from "@/lib/types/food";

export const mealLogSchema = z.object({
  id: z.string(),
  consumedAt: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  recipeId: z.string().optional(),
  foodIds: z.array(z.string()).optional(),
  foods: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string().optional(),
        status: foodStatusSchema.optional(),
      }),
    )
    .optional(),
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
