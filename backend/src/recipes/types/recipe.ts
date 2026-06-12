export type RecipeRatingValue = 1 | 2 | 3 | 4 | 5;

export type Recipe = {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  steps?: string[];
  tags: string[];
  prepTimeMinutes: number;
  rating?: RecipeRatingValue;
  createdAt: string;
  updatedAt: string;
};

export type RecipeFilters = {
  ingredient?: string;
  minRating?: string;
  search?: string;
  tag?: string;
};
