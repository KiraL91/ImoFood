import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SymptomLog as PrismaSymptomLog } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateSymptomLogDto } from "./dto/create-symptom-log.dto";
import type { UpdateSymptomLogDto } from "./dto/update-symptom-log.dto";
import type { SymptomLog } from "./types/symptom-log";

@Injectable()
export class SymptomLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SymptomLog[]> {
    const symptomLogs = await this.prisma.symptomLog.findMany({
      orderBy: {
        loggedAt: "desc",
      },
    });

    return symptomLogs.map((symptomLog) => this.toSymptomLog(symptomLog));
  }

  async findOne(id: string): Promise<SymptomLog> {
    const symptomLog = await this.prisma.symptomLog.findUnique({
      where: {
        id,
      },
    });

    if (!symptomLog) {
      throw new NotFoundException(`Symptom log with id "${id}" was not found.`);
    }

    return this.toSymptomLog(symptomLog);
  }

  async create(createSymptomLogDto: CreateSymptomLogDto): Promise<SymptomLog> {
    const symptomLog = await this.prisma.symptomLog.create({
      data: {
        bloating: createSymptomLogDto.bloating,
        energy: createSymptomLogDto.energy,
        gas: createSymptomLogDto.gas,
        loggedAt: new Date(createSymptomLogDto.loggedAt),
        notes: createSymptomLogDto.notes?.trim() || undefined,
        pain: createSymptomLogDto.pain,
        sleep: createSymptomLogDto.sleep,
        transit: createSymptomLogDto.transit,
      },
    });

    return this.toSymptomLog(symptomLog);
  }

  async update(
    id: string,
    updateSymptomLogDto: UpdateSymptomLogDto,
  ): Promise<SymptomLog> {
    await this.findOne(id);

    const data: Prisma.SymptomLogUpdateInput = {
      bloating: updateSymptomLogDto.bloating,
      energy: updateSymptomLogDto.energy,
      gas: updateSymptomLogDto.gas,
      loggedAt: updateSymptomLogDto.loggedAt
        ? new Date(updateSymptomLogDto.loggedAt)
        : undefined,
      notes: this.normalizeOptionalNotes(updateSymptomLogDto.notes),
      pain: updateSymptomLogDto.pain,
      sleep: updateSymptomLogDto.sleep,
      transit: updateSymptomLogDto.transit,
    };

    const updatedSymptomLog = await this.prisma.symptomLog.update({
      data,
      where: {
        id,
      },
    });

    return this.toSymptomLog(updatedSymptomLog);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

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

  private toSymptomLog(symptomLog: PrismaSymptomLog): SymptomLog {
    return {
      bloating: symptomLog.bloating,
      createdAt: symptomLog.createdAt.toISOString(),
      energy: symptomLog.energy,
      gas: symptomLog.gas,
      id: symptomLog.id,
      loggedAt: symptomLog.loggedAt.toISOString(),
      notes: symptomLog.notes ?? undefined,
      pain: symptomLog.pain,
      sleep: symptomLog.sleep,
      transit: symptomLog.transit,
      updatedAt: symptomLog.updatedAt.toISOString(),
    };
  }
}
