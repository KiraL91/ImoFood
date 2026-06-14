import { Injectable, NotFoundException } from "@nestjs/common";
import { MealLog as PrismaMealLog, Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateMealLogDto } from "./dto/create-meal-log.dto";
import type { UpdateMealLogDto } from "./dto/update-meal-log.dto";
import type { MealLog } from "./types/meal-log";

const mealLogInclude = {
  recipe: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.MealLogInclude;

type PrismaMealLogWithRecipe = PrismaMealLog & {
  recipe?: {
    id: string;
    name: string;
  } | null;
};

@Injectable()
export class MealLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<MealLog[]> {
    const mealLogs = await this.prisma.mealLog.findMany({
      include: mealLogInclude,
      orderBy: {
        consumedAt: "desc",
      },
    });

    return mealLogs.map((mealLog) => this.toMealLog(mealLog));
  }

  async findOne(id: string): Promise<MealLog> {
    const mealLog = await this.prisma.mealLog.findUnique({
      include: mealLogInclude,
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
    const recipeId = this.normalizeRecipeId(createMealLogDto.recipeId);

    if (recipeId) {
      await this.ensureRecipeExists(recipeId);
    }

    const mealLog = await this.prisma.mealLog.create({
      data: {
        consumedAt: new Date(createMealLogDto.consumedAt),
        description: createMealLogDto.description.trim(),
        notes: createMealLogDto.notes?.trim() || undefined,
        recipe: recipeId
          ? {
              connect: {
                id: recipeId,
              },
            }
          : undefined,
      },
      include: mealLogInclude,
    });

    return this.toMealLog(mealLog);
  }

  async update(
    id: string,
    updateMealLogDto: UpdateMealLogDto,
  ): Promise<MealLog> {
    await this.findOne(id);

    const recipeId = this.normalizeRecipeId(updateMealLogDto.recipeId);

    if (recipeId) {
      await this.ensureRecipeExists(recipeId);
    }

    const data: Prisma.MealLogUpdateInput = {
      consumedAt: updateMealLogDto.consumedAt
        ? new Date(updateMealLogDto.consumedAt)
        : undefined,
      description: updateMealLogDto.description?.trim(),
      notes:
        updateMealLogDto.notes?.trim() === ""
          ? null
          : updateMealLogDto.notes?.trim(),
      recipe:
        recipeId === undefined
          ? undefined
          : recipeId
            ? {
                connect: {
                  id: recipeId,
                },
              }
            : {
                disconnect: true,
              },
    };

    const updatedMealLog = await this.prisma.mealLog.update({
      data,
      include: mealLogInclude,
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

  private normalizeRecipeId(
    recipeId?: string | null,
  ): string | null | undefined {
    if (recipeId === undefined) {
      return undefined;
    }

    const normalizedRecipeId = recipeId?.trim();

    return normalizedRecipeId && normalizedRecipeId.length > 0
      ? normalizedRecipeId
      : null;
  }

  private async ensureRecipeExists(recipeId: string): Promise<void> {
    const recipe = await this.prisma.recipe.findUnique({
      select: {
        id: true,
      },
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Recipe with id "${recipeId}" was not found.`,
      );
    }
  }

  private toMealLog(mealLog: PrismaMealLogWithRecipe): MealLog {
    return {
      consumedAt: mealLog.consumedAt.toISOString(),
      createdAt: mealLog.createdAt.toISOString(),
      description: mealLog.description,
      id: mealLog.id,
      notes: mealLog.notes ?? undefined,
      recipe: mealLog.recipe
        ? {
            id: mealLog.recipe.id,
            name: mealLog.recipe.name,
          }
        : undefined,
      recipeId: mealLog.recipeId ?? undefined,
      updatedAt: mealLog.updatedAt.toISOString(),
    };
  }
}
