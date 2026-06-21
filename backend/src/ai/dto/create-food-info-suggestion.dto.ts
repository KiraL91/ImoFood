import { ArrayUnique, IsArray, IsOptional, IsString } from "class-validator";

export class CreateFoodInfoSuggestionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}
