import { z } from "zod";

export const treatmentCategorySchema = z.enum([
  "antibiotic",
  "anti-inflammatory",
  "immunosuppressant",
  "biologic",
  "corticosteroid",
  "prokinetic",
  "transit-regulator",
  "antispasmodic",
  "supplement",
  "rescue",
  "other",
]);

export const treatmentStatusSchema = z.enum(["active", "paused", "completed"]);

export const treatmentTargetSchema = z.enum([
  "IMO",
  "SIBO",
  "EII",
  "SII",
  "bloating",
  "pain",
  "diarrhea",
  "constipation",
  "flare",
  "maintenance",
]);

export const treatmentLogTimingSchema = z.enum([
  "fasting",
  "before-meal",
  "with-meal",
  "after-meal",
  "night",
  "other",
]);

export const treatmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: treatmentCategorySchema,
  targets: z.array(treatmentTargetSchema),
  status: treatmentStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const treatmentLogSchema = z.object({
  id: z.string(),
  treatmentId: z.string(),
  takenAt: z.string(),
  dose: z.string().optional(),
  timing: treatmentLogTimingSchema.optional(),
  relatedMealLogId: z.string().optional(),
  relatedSymptomLogId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TreatmentCategory = z.infer<typeof treatmentCategorySchema>;
export type TreatmentStatus = z.infer<typeof treatmentStatusSchema>;
export type TreatmentTarget = z.infer<typeof treatmentTargetSchema>;
export type TreatmentLogTiming = z.infer<typeof treatmentLogTimingSchema>;
export type Treatment = z.infer<typeof treatmentSchema>;
export type TreatmentLog = z.infer<typeof treatmentLogSchema>;
