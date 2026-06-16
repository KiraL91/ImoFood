import { IsIn, IsISO8601, IsOptional, IsString } from "class-validator";

import {
  TREATMENT_LOG_TIMINGS,
  type TreatmentLogTiming,
} from "../types/treatment";

export class CreateTreatmentLogDto {
  @IsString()
  treatmentId!: string;

  @IsISO8601()
  takenAt!: string;

  @IsOptional()
  @IsString()
  dose?: string;

  @IsOptional()
  @IsIn(TREATMENT_LOG_TIMINGS)
  timing?: TreatmentLogTiming;

  @IsOptional()
  @IsString()
  relatedMealLogId?: string;

  @IsOptional()
  @IsString()
  relatedSymptomLogId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
