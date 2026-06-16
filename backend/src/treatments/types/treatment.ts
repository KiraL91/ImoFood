export const TREATMENT_CATEGORIES = [
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
] as const;

export const TREATMENT_STATUSES = ["active", "paused", "completed"] as const;

export const TREATMENT_TARGETS = [
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
] as const;

export const TREATMENT_LOG_TIMINGS = [
  "fasting",
  "before-meal",
  "with-meal",
  "after-meal",
  "night",
  "other",
] as const;

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];
export type TreatmentStatus = (typeof TREATMENT_STATUSES)[number];
export type TreatmentTarget = (typeof TREATMENT_TARGETS)[number];
export type TreatmentLogTiming = (typeof TREATMENT_LOG_TIMINGS)[number];

export type Treatment = {
  id: string;
  name: string;
  category: TreatmentCategory;
  targets: TreatmentTarget[];
  status: TreatmentStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TreatmentLog = {
  id: string;
  treatmentId: string;
  takenAt: string;
  dose?: string;
  timing?: TreatmentLogTiming;
  relatedMealLogId?: string;
  relatedSymptomLogId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TreatmentFilters = {
  category?: string;
  search?: string;
  status?: string;
  target?: string;
};

export type TreatmentLogFilters = {
  relatedMealLogId?: string;
  relatedSymptomLogId?: string;
  treatmentId?: string;
};
