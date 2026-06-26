export const FOOD_STATUSES = [
  "allowed",
  "testing",
  "caution",
  "avoid",
] as const;

export type FoodStatus = (typeof FOOD_STATUSES)[number];
export type ToleranceScore = 1 | 2 | 3 | 4 | 5;

export type FoodCustomPreferenceFields = {
  notes: boolean;
  status: boolean;
  tolerance: boolean;
};

export type Food = {
  id: string;
  name: string;
  category: string;
  status: FoodStatus;
  tolerance: ToleranceScore;
  notes?: string;
  customPreferenceFields: FoodCustomPreferenceFields;
  hasCustomPreference: boolean;
  suggestedServing?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type FoodFilters = {
  category?: string;
  search?: string;
  status?: FoodStatus;
  tag?: string;
};
