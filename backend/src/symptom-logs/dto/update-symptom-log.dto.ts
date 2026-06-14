import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateSymptomLogDto {
  @IsOptional()
  @IsISO8601()
  loggedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  bloating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  pain?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  gas?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  transit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  energy?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  sleep?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  mealLogId?: string | null;
}
