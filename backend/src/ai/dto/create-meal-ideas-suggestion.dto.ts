import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

const mealIdeaMealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
const mealIdeaGoals = [
  "balanced",
  "quick",
  "gentle",
  "filling",
  "low-risk",
  "use-leftovers",
] as const;

export type MealIdeaMealType = (typeof mealIdeaMealTypes)[number];
export type MealIdeaGoal = (typeof mealIdeaGoals)[number];

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

  @IsOptional()
  @IsIn(mealIdeaMealTypes)
  mealType?: MealIdeaMealType;

  @IsOptional()
  @IsIn(mealIdeaGoals)
  goal?: MealIdeaGoal;

  @IsOptional()
  @IsString()
  variationSeed?: string;
}
