import { Injectable, NotFoundException } from "@nestjs/common";
import { MealLog as PrismaMealLog, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateMealLogDto } from "./dto/create-meal-log.dto";
import type { UpdateMealLogDto } from "./dto/update-meal-log.dto";
import type { MealLog } from "./types/meal-log";

@Injectable()
export class MealLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<MealLog[]> {
    const mealLogs = await this.prisma.mealLog.findMany({
      orderBy: {
        consumedAt: "desc",
      },
    });

    return mealLogs.map((mealLog) => this.toMealLog(mealLog));
  }

  async findOne(id: string): Promise<MealLog> {
    const mealLog = await this.prisma.mealLog.findUnique({
      where: {
        id,
      },
    });

    if (!mealLog) {
      throw new NotFoundException(`Meal log with id "${id}" was not found.`);
    }

    return this.toMealLog(mealLog);
  }

  async create(createMealLogDto: CreateMealLogDto): Promise<MealLog> {
    const mealLog = await this.prisma.mealLog.create({
      data: {
        consumedAt: new Date(createMealLogDto.consumedAt),
        description: createMealLogDto.description.trim(),
        notes: createMealLogDto.notes?.trim() || undefined,
      },
    });

    return this.toMealLog(mealLog);
  }

  async update(
    id: string,
    updateMealLogDto: UpdateMealLogDto,
  ): Promise<MealLog> {
    await this.findOne(id);

    const data: Prisma.MealLogUpdateInput = {
      consumedAt: updateMealLogDto.consumedAt
        ? new Date(updateMealLogDto.consumedAt)
        : undefined,
      description: updateMealLogDto.description?.trim(),
      notes:
        updateMealLogDto.notes?.trim() === ""
          ? null
          : updateMealLogDto.notes?.trim(),
    };

    const updatedMealLog = await this.prisma.mealLog.update({
      data,
      where: {
        id,
      },
    });

    return this.toMealLog(updatedMealLog);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.mealLog.delete({
      where: {
        id,
      },
    });
  }

  private toMealLog(mealLog: PrismaMealLog): MealLog {
    return {
      consumedAt: mealLog.consumedAt.toISOString(),
      createdAt: mealLog.createdAt.toISOString(),
      description: mealLog.description,
      id: mealLog.id,
      notes: mealLog.notes ?? undefined,
      updatedAt: mealLog.updatedAt.toISOString(),
    };
  }
}
