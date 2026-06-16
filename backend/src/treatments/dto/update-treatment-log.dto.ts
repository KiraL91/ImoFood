import { IsIn, IsISO8601, IsOptional, IsString } from "class-validator";

import {
  TREATMENT_LOG_TIMINGS,
  type TreatmentLogTiming,
} from "../types/treatment";

export class UpdateTreatmentLogDto {
  @IsOptional()
  @IsString()
  treatmentId?: string;

  @IsOptional()
  @IsISO8601()
  takenAt?: string;

  @IsOptional()
  @IsString()
  dose?: string | null;

  @IsOptional()
  @IsIn(TREATMENT_LOG_TIMINGS)
  timing?: TreatmentLogTiming | null;

  @IsOptional()
  @IsString()
  relatedMealLogId?: string | null;

  @IsOptional()
  @IsString()
  relatedSymptomLogId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
