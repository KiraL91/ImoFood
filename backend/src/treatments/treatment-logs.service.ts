import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, TreatmentLog as PrismaTreatmentLog } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateTreatmentLogDto } from "./dto/create-treatment-log.dto";
import type { UpdateTreatmentLogDto } from "./dto/update-treatment-log.dto";
import {
  type TreatmentLog,
  type TreatmentLogFilters,
  type TreatmentLogTiming,
} from "./types/treatment";

@Injectable()
export class TreatmentLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: TreatmentLogFilters = {}): Promise<TreatmentLog[]> {
    const where: Prisma.TreatmentLogWhereInput = {};

    const treatmentId = this.normalizeOptionalIdFilter(filters.treatmentId);
    const relatedMealLogId = this.normalizeOptionalIdFilter(
      filters.relatedMealLogId,
    );
    const relatedSymptomLogId = this.normalizeOptionalIdFilter(
      filters.relatedSymptomLogId,
    );

    if (treatmentId) {
      where.treatmentId = treatmentId;
    }

    if (relatedMealLogId) {
      where.relatedMealLogId = relatedMealLogId;
    }

    if (relatedSymptomLogId) {
      where.relatedSymptomLogId = relatedSymptomLogId;
    }

    const treatmentLogs = await this.prisma.treatmentLog.findMany({
      orderBy: {
        takenAt: "desc",
      },
      where,
    });

    return treatmentLogs.map((treatmentLog) =>
      this.toTreatmentLog(treatmentLog),
    );
  }

  async findOne(id: string): Promise<TreatmentLog> {
    const treatmentLog = await this.prisma.treatmentLog.findUnique({
      where: {
        id,
      },
    });

    if (!treatmentLog) {
      throw new NotFoundException(
        `Treatment log with id "${id}" was not found.`,
      );
    }

    return this.toTreatmentLog(treatmentLog);
  }

  async create(
    createTreatmentLogDto: CreateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    const treatmentId = this.normalizeRequiredId(
      createTreatmentLogDto.treatmentId,
      "treatmentId",
    );
    const relatedMealLogId = this.normalizeOptionalRelationId(
      createTreatmentLogDto.relatedMealLogId,
    );
    const relatedSymptomLogId = this.normalizeOptionalRelationId(
      createTreatmentLogDto.relatedSymptomLogId,
    );

    await this.ensureTreatmentExists(treatmentId);
    await this.ensureOptionalMealLogExists(relatedMealLogId);
    await this.ensureOptionalSymptomLogExists(relatedSymptomLogId);

    const treatmentLog = await this.prisma.treatmentLog.create({
      data: {
        dose: createTreatmentLogDto.dose?.trim() || undefined,
        notes: createTreatmentLogDto.notes?.trim() || undefined,
        relatedMealLog: relatedMealLogId
          ? {
              connect: {
                id: relatedMealLogId,
              },
            }
          : undefined,
        relatedSymptomLog: relatedSymptomLogId
          ? {
              connect: {
                id: relatedSymptomLogId,
              },
            }
          : undefined,
        takenAt: new Date(createTreatmentLogDto.takenAt),
        timing: createTreatmentLogDto.timing,
        treatment: {
          connect: {
            id: treatmentId,
          },
        },
      },
    });

    return this.toTreatmentLog(treatmentLog);
  }

  async update(
    id: string,
    updateTreatmentLogDto: UpdateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    await this.findOne(id);

    const treatmentId = this.normalizeOptionalRequiredId(
      updateTreatmentLogDto.treatmentId,
      "treatmentId",
    );
    const relatedMealLogId = this.normalizeOptionalRelationId(
      updateTreatmentLogDto.relatedMealLogId,
    );
    const relatedSymptomLogId = this.normalizeOptionalRelationId(
      updateTreatmentLogDto.relatedSymptomLogId,
    );

    if (treatmentId) {
      await this.ensureTreatmentExists(treatmentId);
    }

    await this.ensureOptionalMealLogExists(relatedMealLogId);
    await this.ensureOptionalSymptomLogExists(relatedSymptomLogId);

    const data: Prisma.TreatmentLogUpdateInput = {
      dose: this.normalizeOptionalString(updateTreatmentLogDto.dose),
      notes: this.normalizeOptionalString(updateTreatmentLogDto.notes),
      relatedMealLog: this.toOptionalRelation(relatedMealLogId),
      relatedSymptomLog: this.toOptionalRelation(relatedSymptomLogId),
      takenAt: updateTreatmentLogDto.takenAt
        ? new Date(updateTreatmentLogDto.takenAt)
        : undefined,
      timing: this.normalizeOptionalString(updateTreatmentLogDto.timing),
      treatment: treatmentId
        ? {
            connect: {
              id: treatmentId,
            },
          }
        : undefined,
    };

    const updatedTreatmentLog = await this.prisma.treatmentLog.update({
      data,
      where: {
        id,
      },
    });

    return this.toTreatmentLog(updatedTreatmentLog);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.treatmentLog.delete({
      where: {
        id,
      },
    });
  }

  private normalizeRequiredId(value: string, fieldName: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    return normalizedValue;
  }

  private normalizeOptionalRequiredId(
    value: string | null | undefined,
    fieldName: string,
  ): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    return this.normalizeRequiredId(value ?? "", fieldName);
  }

  private normalizeOptionalRelationId(
    value?: string | null,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalizedValue = value?.trim();

    return normalizedValue && normalizedValue.length > 0
      ? normalizedValue
      : null;
  }

  private normalizeOptionalIdFilter(value?: string): string | undefined {
    const normalizedValue = value?.trim();

    return normalizedValue && normalizedValue.length > 0
      ? normalizedValue
      : undefined;
  }

  private normalizeOptionalString(
    value?: string | null,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalizedValue = value?.trim();

    return normalizedValue && normalizedValue.length > 0
      ? normalizedValue
      : null;
  }

  private toOptionalRelation(
    id: string | null | undefined,
  ): { connect: { id: string } } | { disconnect: true } | undefined {
    if (id === undefined) {
      return undefined;
    }

    return id
      ? {
          connect: {
            id,
          },
        }
      : {
          disconnect: true,
        };
  }

  private async ensureTreatmentExists(treatmentId: string): Promise<void> {
    const treatment = await this.prisma.treatment.findUnique({
      select: {
        id: true,
      },
      where: {
        id: treatmentId,
      },
    });

    if (!treatment) {
      throw new NotFoundException(
        `Treatment with id "${treatmentId}" was not found.`,
      );
    }
  }

  private async ensureOptionalMealLogExists(
    mealLogId: string | null | undefined,
  ): Promise<void> {
    if (!mealLogId) {
      return;
    }

    const mealLog = await this.prisma.mealLog.findUnique({
      select: {
        id: true,
      },
      where: {
        id: mealLogId,
      },
    });

    if (!mealLog) {
      throw new NotFoundException(
        `Meal log with id "${mealLogId}" was not found.`,
      );
    }
  }

  private async ensureOptionalSymptomLogExists(
    symptomLogId: string | null | undefined,
  ): Promise<void> {
    if (!symptomLogId) {
      return;
    }

    const symptomLog = await this.prisma.symptomLog.findUnique({
      select: {
        id: true,
      },
      where: {
        id: symptomLogId,
      },
    });

    if (!symptomLog) {
      throw new NotFoundException(
        `Symptom log with id "${symptomLogId}" was not found.`,
      );
    }
  }

  private toTreatmentLog(treatmentLog: PrismaTreatmentLog): TreatmentLog {
    return {
      createdAt: treatmentLog.createdAt.toISOString(),
      dose: treatmentLog.dose ?? undefined,
      id: treatmentLog.id,
      notes: treatmentLog.notes ?? undefined,
      relatedMealLogId: treatmentLog.relatedMealLogId ?? undefined,
      relatedSymptomLogId: treatmentLog.relatedSymptomLogId ?? undefined,
      takenAt: treatmentLog.takenAt.toISOString(),
      timing: treatmentLog.timing
        ? (treatmentLog.timing as TreatmentLogTiming)
        : undefined,
      treatmentId: treatmentLog.treatmentId,
      updatedAt: treatmentLog.updatedAt.toISOString(),
    };
  }
}
