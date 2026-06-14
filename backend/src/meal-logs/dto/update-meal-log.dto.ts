import { IsISO8601, IsOptional, IsString } from "class-validator";

export class UpdateMealLogDto {
  @IsOptional()
  @IsISO8601()
  consumedAt?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  recipeId?: string | null;
}
