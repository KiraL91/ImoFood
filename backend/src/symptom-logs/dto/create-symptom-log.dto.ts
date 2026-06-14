import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateSymptomLogDto {
  @IsISO8601()
  loggedAt!: string;

  @IsInt()
  @Min(0)
  @Max(10)
  bloating!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  pain!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  gas!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  transit!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  energy!: number;

  @IsInt()
  @Min(0)
  @Max(10)
  sleep!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
