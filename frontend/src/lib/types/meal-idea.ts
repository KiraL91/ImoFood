import { z } from "zod";

export const mealIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(z.string()),
  reason: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MealIdea = z.infer<typeof mealIdeaSchema>;
