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

export class CreateTreatmentDto {
  @IsString()
  name!: string;

  @IsIn(TREATMENT_CATEGORIES)
  category!: TreatmentCategory;

  @IsArray()
  @ArrayUnique()
  @IsIn(TREATMENT_TARGETS, { each: true })
  targets!: TreatmentTarget[];

  @IsIn(TREATMENT_STATUSES)
  status!: TreatmentStatus;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
