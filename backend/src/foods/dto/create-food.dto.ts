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

export class CreateFoodDto {
  @IsString()
  name!: string;

  @IsString()
  category!: string;

  @IsIn(FOOD_STATUSES)
  status!: FoodStatus;

  @IsInt()
  @Min(1)
  @Max(5)
  tolerance!: ToleranceScore;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
