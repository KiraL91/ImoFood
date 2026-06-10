import { z } from "zod";

export const userPreferenceSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.unknown(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type UserPreference = z.infer<typeof userPreferenceSchema>;
