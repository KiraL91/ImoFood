import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
} from "class-validator";

import {
  TREATMENT_CATEGORIES,
  TREATMENT_STATUSES,
  TREATMENT_TARGETS,
  type TreatmentCategory,
  type TreatmentStatus,
  type TreatmentTarget,
} from "../types/treatment";

export class UpdateTreatmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(TREATMENT_CATEGORIES)
  category?: TreatmentCategory;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(TREATMENT_TARGETS, { each: true })
  targets?: TreatmentTarget[];

  @IsOptional()
  @IsIn(TREATMENT_STATUSES)
  status?: TreatmentStatus;

  @IsOptional()
  @IsISO8601()
  startDate?: string | null;

  @IsOptional()
  @IsISO8601()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
