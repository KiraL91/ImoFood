import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import {
  FOOD_STATUSES,
  type FoodStatus,
  type ToleranceScore,
} from "../types/food";

export class UpdateFoodPreferenceDto {
  @IsOptional()
  @IsIn(FOOD_STATUSES)
  status?: FoodStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  tolerance?: ToleranceScore;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
