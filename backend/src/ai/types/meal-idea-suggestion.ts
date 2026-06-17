export type AiConfigurationStatus = "disabled" | "ready";

export type AiConfiguration = {
  capabilities: string[];
  enabled: boolean;
  model: string;
  provider: string;
  status: AiConfigurationStatus;
};

export type AiMealIdeasContextSummary = {
  highRatedRecipesCount: number;
  reasonableFoodsCount: number;
  safeFoodsCount: number;
};

export type AiMealIdeaSuggestion = {
  items: string[];
  reason?: string;
  tags: string[];
  title: string;
};

export type AiMealIdeasSuggestionResult = {
  context: AiMealIdeasContextSummary;
  model: string;
  provider: string;
  suggestions: AiMealIdeaSuggestion[];
};
