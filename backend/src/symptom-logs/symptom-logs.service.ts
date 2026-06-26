import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SymptomLog as PrismaSymptomLog } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateSymptomLogDto } from "./dto/create-symptom-log.dto";
import type { UpdateSymptomLogDto } from "./dto/update-symptom-log.dto";
import type { SymptomLog } from "./types/symptom-log";

const symptomLogInclude = {
  mealLog: {
    select: {
      consumedAt: true,
      description: true,
      id: true,
    },
  },
} satisfies Prisma.SymptomLogInclude;

type PrismaSymptomLogWithMealLog = PrismaSymptomLog & {
  mealLog?: {
    consumedAt: Date;
    description: string;
    id: string;
  } | null;
};

@Injectable()
export class SymptomLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<SymptomLog[]> {
    const symptomLogs = await this.prisma.symptomLog.findMany({
      include: symptomLogInclude,
      orderBy: {
        loggedAt: "desc",
      },
      where: {
        userId,
      },
    });

    return symptomLogs.map((symptomLog) => this.toSymptomLog(symptomLog));
  }

  async findOne(id: string, userId: string): Promise<SymptomLog> {
    const symptomLog = await this.prisma.symptomLog.findFirst({
      include: symptomLogInclude,
      where: {
        id,
        userId,
      },
    });

    if (!symptomLog) {
      throw new NotFoundException(`Symptom log with id "${id}" was not found.`);
    }

    return this.toSymptomLog(symptomLog);
  }

  async create(
    createSymptomLogDto: CreateSymptomLogDto,
    userId: string,
  ): Promise<SymptomLog> {
    const mealLogId = this.normalizeMealLogId(createSymptomLogDto.mealLogId);

    if (mealLogId) {
      await this.ensureMealLogExists(mealLogId, userId);
    }

    const symptomLog = await this.prisma.symptomLog.create({
      data: {
        bloating: createSymptomLogDto.bloating,
        energy: createSymptomLogDto.energy,
        gas: createSymptomLogDto.gas,
        loggedAt: new Date(createSymptomLogDto.loggedAt),
        mealLog: mealLogId
          ? {
              connect: {
                id: mealLogId,
              },
            }
          : undefined,
        notes: createSymptomLogDto.notes?.trim() || undefined,
        pain: createSymptomLogDto.pain,
        sleep: createSymptomLogDto.sleep,
        transit: createSymptomLogDto.transit,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: symptomLogInclude,
    });

    return this.toSymptomLog(symptomLog);
  }

  async update(
    id: string,
    updateSymptomLogDto: UpdateSymptomLogDto,
    userId: string,
  ): Promise<SymptomLog> {
    await this.findOne(id, userId);

    const mealLogId = this.normalizeMealLogId(updateSymptomLogDto.mealLogId);

    if (mealLogId) {
      await this.ensureMealLogExists(mealLogId, userId);
    }

    const data: Prisma.SymptomLogUpdateInput = {
      bloating: updateSymptomLogDto.bloating,
      energy: updateSymptomLogDto.energy,
      gas: updateSymptomLogDto.gas,
      loggedAt: updateSymptomLogDto.loggedAt
        ? new Date(updateSymptomLogDto.loggedAt)
        : undefined,
      mealLog:
        mealLogId === undefined
          ? undefined
          : mealLogId
            ? {
                connect: {
                  id: mealLogId,
                },
              }
            : {
                disconnect: true,
              },
      notes: this.normalizeOptionalNotes(updateSymptomLogDto.notes),
      pain: updateSymptomLogDto.pain,
      sleep: updateSymptomLogDto.sleep,
      transit: updateSymptomLogDto.transit,
    };

    const updatedSymptomLog = await this.prisma.symptomLog.update({
      data,
      include: symptomLogInclude,
      where: {
        id,
      },
    });

    return this.toSymptomLog(updatedSymptomLog);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.symptomLog.delete({
      where: {
        id,
      },
    });
  }

  private normalizeOptionalNotes(
    notes?: string | null,
  ): string | null | undefined {
    if (notes === undefined) {
      return undefined;
    }

    const trimmedNotes = notes?.trim();

    return trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null;
  }

  private normalizeMealLogId(
    mealLogId?: string | null,
  ): string | null | undefined {
    if (mealLogId === undefined) {
      return undefined;
    }

    const normalizedMealLogId = mealLogId?.trim();

    return normalizedMealLogId && normalizedMealLogId.length > 0
      ? normalizedMealLogId
      : null;
  }

  private async ensureMealLogExists(
    mealLogId: string,
    userId: string,
  ): Promise<void> {
    const mealLog = await this.prisma.mealLog.findFirst({
      select: {
        id: true,
      },
      where: {
        id: mealLogId,
        userId,
      },
    });

    if (!mealLog) {
      throw new NotFoundException(
        `Meal log with id "${mealLogId}" was not found.`,
      );
    }
  }

  private toSymptomLog(symptomLog: PrismaSymptomLogWithMealLog): SymptomLog {
    return {
      bloating: symptomLog.bloating,
      createdAt: symptomLog.createdAt.toISOString(),
      energy: symptomLog.energy,
      gas: symptomLog.gas,
      id: symptomLog.id,
      loggedAt: symptomLog.loggedAt.toISOString(),
      mealLog: symptomLog.mealLog
        ? {
            consumedAt: symptomLog.mealLog.consumedAt.toISOString(),
            description: symptomLog.mealLog.description,
            id: symptomLog.mealLog.id,
          }
        : undefined,
      mealLogId: symptomLog.mealLogId ?? undefined,
      notes: symptomLog.notes ?? undefined,
      pain: symptomLog.pain,
      sleep: symptomLog.sleep,
      transit: symptomLog.transit,
      updatedAt: symptomLog.updatedAt.toISOString(),
    };
  }
}
