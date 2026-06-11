import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import {
  FOOD_STATUSES,
  type FoodStatus,
  type ToleranceScore,
} from "../types/food";

export class UpdateFoodDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

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
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
