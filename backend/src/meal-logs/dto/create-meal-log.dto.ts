import {
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateMealLogDto {
  @IsISO8601()
  consumedAt!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  recipeId?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  foodIds?: string[];
}
