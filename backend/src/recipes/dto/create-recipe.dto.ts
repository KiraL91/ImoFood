import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

import type { RecipeRatingValue } from "../types/recipe";

export class CreateRecipeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsInt()
  @Min(1)
  prepTimeMinutes!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: RecipeRatingValue;
}
