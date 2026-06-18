import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateMealIdeasSuggestionDto {
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  foodIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  preferredTags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  avoidedTags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
