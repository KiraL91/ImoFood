import { z } from "zod";

const symptomScoreSchema = z.number().int().min(0).max(10);

export const symptomLogSchema = z.object({
  id: z.string(),
  loggedAt: z.string(),
  bloating: symptomScoreSchema,
  pain: symptomScoreSchema,
  gas: symptomScoreSchema,
  transit: symptomScoreSchema,
  energy: symptomScoreSchema,
  sleep: symptomScoreSchema,
  notes: z.string().optional(),
  mealLogId: z.string().optional(),
  mealLog: z
    .object({
      id: z.string(),
      consumedAt: z.string(),
      description: z.string(),
    })
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SymptomLog = z.infer<typeof symptomLogSchema>;
