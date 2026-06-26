import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Food as PrismaFood,
  FoodPreference as PrismaFoodPreference,
  FoodStatus as PrismaFoodStatus,
  Prisma,
} from "@prisma/client";

import type { CreateFoodDto } from "./dto/create-food.dto";
import type { UpdateFoodPreferenceDto } from "./dto/update-food-preference.dto";
import type { UpdateFoodDto } from "./dto/update-food.dto";
import { FOOD_STATUSES, type Food, type FoodFilters } from "./types/food";
import { PrismaService } from "../prisma/prisma.service";

const foodStatusToPrisma: Record<Food["status"], PrismaFoodStatus> = {
  allowed: PrismaFoodStatus.allowed,
  avoid: PrismaFoodStatus.avoid,
  caution: PrismaFoodStatus.caution,
  testing: PrismaFoodStatus.testing,
};

type FoodPreferenceRecord = Pick<
  PrismaFoodPreference,
  "notes" | "status" | "tolerance"
>;

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filters: FoodFilters = {}): Promise<Food[]> {
    this.assertValidStatus(filters.status);

    const search = filters.search?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const tag = filters.tag?.trim().toLowerCase();
    const where: Prisma.FoodWhereInput = {};

    const preferenceInclude = this.getPreferenceInclude(userId);

    if (category) {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          preferences: {
            some: {
              notes: {
                contains: search,
                mode: "insensitive",
              },
              userId,
            },
          },
        },
        {
          suggestedServing: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    const foods = await this.prisma.food.findMany({
      include: preferenceInclude,
      orderBy: {
        name: "asc",
      },
      where,
    });

    const mergedFoods = foods.map((food) => this.toFood(food));

    return filters.status
      ? mergedFoods.filter((food) => food.status === filters.status)
      : mergedFoods;
  }

  async findOne(id: string, userId: string): Promise<Food> {
    const food = await this.prisma.food.findUnique({
      include: this.getPreferenceInclude(userId),
      where: {
        id,
      },
    });

    if (!food) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }

    return this.toFood(food);
  }

  async create(createFoodDto: CreateFoodDto, userId: string): Promise<Food> {
    const food = await this.prisma.food.create({
      data: {
        category: createFoodDto.category.trim(),
        name: createFoodDto.name.trim(),
        notes: createFoodDto.notes?.trim() || undefined,
        preferences: {
          create: {
            notes: createFoodDto.notes?.trim() || undefined,
            status: foodStatusToPrisma[createFoodDto.status],
            tolerance: createFoodDto.tolerance,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
        status: foodStatusToPrisma[createFoodDto.status],
        suggestedServing: createFoodDto.suggestedServing?.trim() || undefined,
        tags: this.normalizeTags(createFoodDto.tags),
        tolerance: createFoodDto.tolerance,
      },
      include: this.getPreferenceInclude(userId),
    });

    return this.toFood(food);
  }

  async update(
    id: string,
    updateFoodDto: UpdateFoodDto,
    userId: string,
  ): Promise<Food> {
    await this.findOne(id, userId);

    const normalizedNotes = this.normalizeOptionalText(updateFoodDto.notes);
    const data: Prisma.FoodUpdateInput = {
      category: updateFoodDto.category?.trim(),
      name: updateFoodDto.name?.trim(),
      notes: normalizedNotes,
      status: updateFoodDto.status
        ? foodStatusToPrisma[updateFoodDto.status]
        : undefined,
      suggestedServing:
        updateFoodDto.suggestedServing?.trim() === ""
          ? null
          : updateFoodDto.suggestedServing?.trim(),
      tags: updateFoodDto.tags
        ? this.normalizeTags(updateFoodDto.tags)
        : undefined,
      tolerance: updateFoodDto.tolerance,
    };

    const updatedFood = await this.prisma.$transaction(async (prisma) => {
      const food = await prisma.food.update({
        data,
        where: {
          id,
        },
      });

      if (
        updateFoodDto.status !== undefined ||
        updateFoodDto.tolerance !== undefined ||
        updateFoodDto.notes !== undefined
      ) {
        await prisma.foodPreference.upsert({
          create: {
            foodId: id,
            notes: normalizedNotes === undefined ? food.notes : normalizedNotes,
            status: updateFoodDto.status
              ? foodStatusToPrisma[updateFoodDto.status]
              : food.status,
            tolerance: updateFoodDto.tolerance ?? food.tolerance,
            userId,
          },
          update: {
            notes: normalizedNotes,
            status: updateFoodDto.status
              ? foodStatusToPrisma[updateFoodDto.status]
              : undefined,
            tolerance: updateFoodDto.tolerance,
          },
          where: {
            userId_foodId: {
              foodId: id,
              userId,
            },
          },
        });
      }

      return prisma.food.findUniqueOrThrow({
        include: this.getPreferenceInclude(userId),
        where: {
          id,
        },
      });
    });

    return this.toFood(updatedFood);
  }

  async updatePreference(
    id: string,
    updateFoodPreferenceDto: UpdateFoodPreferenceDto,
    userId: string,
  ): Promise<Food> {
    const food = await this.prisma.food.findUnique({
      where: {
        id,
      },
    });

    if (!food) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }

    const normalizedNotes = this.normalizeOptionalText(
      updateFoodPreferenceDto.notes,
    );

    await this.prisma.foodPreference.upsert({
      create: {
        foodId: id,
        notes: normalizedNotes === undefined ? food.notes : normalizedNotes,
        status: updateFoodPreferenceDto.status
          ? foodStatusToPrisma[updateFoodPreferenceDto.status]
          : food.status,
        tolerance: updateFoodPreferenceDto.tolerance ?? food.tolerance,
        userId,
      },
      update: {
        notes: normalizedNotes,
        status: updateFoodPreferenceDto.status
          ? foodStatusToPrisma[updateFoodPreferenceDto.status]
          : undefined,
        tolerance: updateFoodPreferenceDto.tolerance,
      },
      where: {
        userId_foodId: {
          foodId: id,
          userId,
        },
      },
    });

    const updatedFood = await this.prisma.food.findUniqueOrThrow({
      include: this.getPreferenceInclude(userId),
      where: {
        id,
      },
    });

    return this.toFood(updatedFood);
  }

  async resetPreference(id: string, userId: string): Promise<Food> {
    const food = await this.prisma.food.findUnique({
      select: {
        id: true,
      },
      where: {
        id,
      },
    });

    if (!food) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }

    await this.prisma.foodPreference.deleteMany({
      where: {
        foodId: id,
        userId,
      },
    });

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.food.delete({
      where: {
        id,
      },
    });
  }

  private assertValidStatus(status?: string): void {
    if (status && !FOOD_STATUSES.includes(status as never)) {
      throw new BadRequestException(
        `Invalid status "${status}". Expected one of: ${FOOD_STATUSES.join(", ")}.`,
      );
    }
  }

  private normalizeTags(tags: string[]): string[] {
    return Array.from(
      new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
    );
  }

  private normalizeOptionalText(
    value?: string | null,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmedValue = value?.trim();

    return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null;
  }

  private normalizeNullableText(value?: string | null): string | null {
    const trimmedValue = value?.trim();

    return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null;
  }

  private getPreferenceInclude(userId: string) {
    return {
      preferences: {
        take: 1,
        where: {
          userId,
        },
      },
    } satisfies Prisma.FoodInclude;
  }

  private getCustomPreferenceFields(
    food: PrismaFood,
    preference?: FoodPreferenceRecord,
  ): Food["customPreferenceFields"] {
    if (!preference) {
      return {
        notes: false,
        status: false,
        tolerance: false,
      };
    }

    return {
      notes:
        this.normalizeNullableText(preference.notes) !==
        this.normalizeNullableText(food.notes),
      status: preference.status !== food.status,
      tolerance: preference.tolerance !== food.tolerance,
    };
  }

  private toFood(
    food: PrismaFood & { preferences?: FoodPreferenceRecord[] },
  ): Food {
    const preference = food.preferences?.[0];
    const customPreferenceFields = this.getCustomPreferenceFields(
      food,
      preference,
    );

    return {
      category: food.category,
      createdAt: food.createdAt.toISOString(),
      customPreferenceFields,
      hasCustomPreference: Object.values(customPreferenceFields).some(Boolean),
      id: food.id,
      name: food.name,
      notes: preference?.notes ?? food.notes ?? undefined,
      status: (preference?.status ?? food.status) as Food["status"],
      suggestedServing: food.suggestedServing ?? undefined,
      tags: [...food.tags],
      tolerance: (preference?.tolerance ?? food.tolerance) as Food["tolerance"],
      updatedAt: food.updatedAt.toISOString(),
    };
  }
}
