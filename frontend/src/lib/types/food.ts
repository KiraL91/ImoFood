import { z } from "zod";

export const foodStatusSchema = z.enum(["allowed", "testing", "caution", "avoid"]);

export const toleranceSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const foodCustomPreferenceFieldsSchema = z.object({
  notes: z.boolean(),
  status: z.boolean(),
  tolerance: z.boolean(),
});

export const foodSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  status: foodStatusSchema,
  tolerance: toleranceSchema,
  notes: z.string().optional(),
  customPreferenceFields: foodCustomPreferenceFieldsSchema,
  hasCustomPreference: z.boolean(),
  suggestedServing: z.string().optional(),
  tags: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type FoodStatus = z.infer<typeof foodStatusSchema>;
export type ToleranceScore = z.infer<typeof toleranceSchema>;
export type Food = z.infer<typeof foodSchema>;
