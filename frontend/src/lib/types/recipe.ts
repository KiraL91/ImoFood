import { z } from "zod";

export const recipeRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  prepTimeMinutes: z.number().int().positive(),
  rating: recipeRatingSchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type RecipeRatingValue = z.infer<typeof recipeRatingSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
