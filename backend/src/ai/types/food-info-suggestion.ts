import type { FoodStatus, ToleranceScore } from "../../foods/types/food";

export type AiFoodInfoSuggestion = {
  category: string;
  notes?: string;
  status: FoodStatus;
  suggestedServing: string;
  tags: string[];
  tolerance: ToleranceScore;
};

export type AiFoodInfoSuggestionResult = {
  model: string;
  provider: string;
  suggestion: AiFoodInfoSuggestion;
};
