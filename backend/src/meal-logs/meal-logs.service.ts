import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateMealLogDto } from "./dto/create-meal-log.dto";
import type { UpdateMealLogDto } from "./dto/update-meal-log.dto";
import type { MealLog } from "./types/meal-log";

const mealLogInclude = {
  foods: {
    include: {
      food: {
        select: {
          category: true,
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  recipe: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.MealLogInclude;

type PrismaMealLogWithRelations = Prisma.MealLogGetPayload<{
  include: typeof mealLogInclude;
}>;

@Injectable()
export class MealLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<MealLog[]> {
    const mealLogs = await this.prisma.mealLog.findMany({
      include: mealLogInclude,
      orderBy: {
        consumedAt: "desc",
      },
      where: {
        userId,
      },
    });

    return mealLogs.map((mealLog) => this.toMealLog(mealLog));
  }

  async findOne(id: string, userId: string): Promise<MealLog> {
    const mealLog = await this.prisma.mealLog.findFirst({
      include: mealLogInclude,
      where: {
        id,
        userId,
      },
    });

    if (!mealLog) {
      throw new NotFoundException(`Meal log with id "${id}" was not found.`);
    }

    return this.toMealLog(mealLog);
  }

  async create(
    createMealLogDto: CreateMealLogDto,
    userId: string,
  ): Promise<MealLog> {
    const recipeId = this.normalizeRecipeId(createMealLogDto.recipeId);
    const foodIds = this.normalizeFoodIds(createMealLogDto.foodIds) ?? [];

    if (recipeId) {
      await this.ensureRecipeExists(recipeId, userId);
    }

    await this.ensureFoodsExist(foodIds, userId);

    const mealLog = await this.prisma.mealLog.create({
      data: {
        consumedAt: new Date(createMealLogDto.consumedAt),
        description: createMealLogDto.description.trim(),
        foods:
          foodIds.length > 0
            ? {
                create: foodIds.map((foodId) => ({
                  food: {
                    connect: {
                      id: foodId,
                    },
                  },
                })),
              }
            : undefined,
        notes: createMealLogDto.notes?.trim() || undefined,
        recipe: recipeId
          ? {
              connect: {
                id: recipeId,
              },
            }
          : undefined,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: mealLogInclude,
    });

    return this.toMealLog(mealLog);
  }

  async update(
    id: string,
    updateMealLogDto: UpdateMealLogDto,
    userId: string,
  ): Promise<MealLog> {
    await this.findOne(id, userId);

    const recipeId = this.normalizeRecipeId(updateMealLogDto.recipeId);
    const foodIds = this.normalizeFoodIds(updateMealLogDto.foodIds);

    if (recipeId) {
      await this.ensureRecipeExists(recipeId, userId);
    }

    if (foodIds !== undefined) {
      await this.ensureFoodsExist(foodIds, userId);
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

    const updatedMealLog = await this.prisma.$transaction(async (prisma) => {
      await prisma.mealLog.update({
        data,
        where: {
          id,
        },
      });

      if (foodIds !== undefined) {
        await prisma.mealLogFood.deleteMany({
          where: {
            mealLogId: id,
          },
        });

        if (foodIds.length > 0) {
          await prisma.mealLogFood.createMany({
            data: foodIds.map((foodId) => ({
              foodId,
              mealLogId: id,
            })),
          });
        }
      }

      return prisma.mealLog.findUniqueOrThrow({
        include: mealLogInclude,
        where: {
          id,
        },
      });
    });

    return this.toMealLog(updatedMealLog);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

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

  private normalizeFoodIds(foodIds?: string[]): string[] | undefined {
    if (foodIds === undefined) {
      return undefined;
    }

    return Array.from(
      new Set(
        foodIds
          .map((foodId) => foodId.trim())
          .filter((foodId) => foodId.length > 0),
      ),
    );
  }

  private async ensureRecipeExists(
    recipeId: string,
    userId: string,
  ): Promise<void> {
    const recipe = await this.prisma.recipe.findFirst({
      select: {
        id: true,
      },
      where: {
        id: recipeId,
        userId,
      },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Recipe with id "${recipeId}" was not found.`,
      );
    }
  }

  private async ensureFoodsExist(
    foodIds: string[],
    userId: string,
  ): Promise<void> {
    if (foodIds.length === 0) {
      return;
    }

    const foods = await this.prisma.food.findMany({
      select: {
        id: true,
      },
      where: {
        id: {
          in: foodIds,
        },
        userId,
      },
    });
    const existingFoodIds = new Set(foods.map((food) => food.id));
    const missingFoodIds = foodIds.filter(
      (foodId) => !existingFoodIds.has(foodId),
    );

    if (missingFoodIds.length > 0) {
      throw new NotFoundException(
        `Food IDs not found: ${missingFoodIds.join(", ")}.`,
      );
    }
  }

  private toMealLog(mealLog: PrismaMealLogWithRelations): MealLog {
    const foods = mealLog.foods.map((mealLogFood) => ({
      category: mealLogFood.food.category,
      id: mealLogFood.food.id,
      name: mealLogFood.food.name,
      status: mealLogFood.food.status,
    }));

    return {
      consumedAt: mealLog.consumedAt.toISOString(),
      createdAt: mealLog.createdAt.toISOString(),
      description: mealLog.description,
      foodIds: foods.map((food) => food.id),
      foods,
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
