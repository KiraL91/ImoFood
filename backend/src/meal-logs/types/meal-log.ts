import type { FoodStatus } from "../../foods/types/food";

export type MealLog = {
  id: string;
  consumedAt: string;
  description: string;
  notes?: string;
  recipeId?: string;
  foodIds: string[];
  foods: {
    id: string;
    name: string;
    category: string;
    status: FoodStatus;
  }[];
  recipe?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};
