export type MealLog = {
  id: string;
  consumedAt: string;
  description: string;
  notes?: string;
  recipeId?: string;
  recipe?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};
