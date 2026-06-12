import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Food as PrismaFood,
  FoodStatus as PrismaFoodStatus,
  Prisma,
} from "@prisma/client";

import type { CreateFoodDto } from "./dto/create-food.dto";
import type { UpdateFoodDto } from "./dto/update-food.dto";
import { FOOD_STATUSES, type Food, type FoodFilters } from "./types/food";
import { PrismaService } from "../prisma/prisma.service";

const foodStatusToPrisma: Record<Food["status"], PrismaFoodStatus> = {
  allowed: PrismaFoodStatus.allowed,
  avoid: PrismaFoodStatus.avoid,
  caution: PrismaFoodStatus.caution,
  testing: PrismaFoodStatus.testing,
};

@Injectable()
export class FoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FoodFilters = {}): Promise<Food[]> {
    this.assertValidStatus(filters.status);

    const search = filters.search?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const tag = filters.tag?.trim().toLowerCase();
    const where: Prisma.FoodWhereInput = {};

    if (filters.status) {
      where.status = foodStatusToPrisma[filters.status];
    }

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
      orderBy: {
        name: "asc",
      },
      where,
    });

    return foods.map((food) => this.toFood(food));
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.prisma.food.findUnique({
      where: {
        id,
      },
    });

    if (!food) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }

    return this.toFood(food);
  }

  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = await this.prisma.food.create({
      data: {
        category: createFoodDto.category.trim(),
        name: createFoodDto.name.trim(),
        notes: createFoodDto.notes?.trim(),
        status: foodStatusToPrisma[createFoodDto.status],
        suggestedServing: createFoodDto.suggestedServing?.trim() || undefined,
        tags: this.normalizeTags(createFoodDto.tags),
        tolerance: createFoodDto.tolerance,
      },
    });

    return this.toFood(food);
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    await this.findOne(id);

    const data: Prisma.FoodUpdateInput = {
      category: updateFoodDto.category?.trim(),
      name: updateFoodDto.name?.trim(),
      notes: updateFoodDto.notes?.trim(),
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

    const updatedFood = await this.prisma.food.update({
      data,
      where: {
        id,
      },
    });

    return this.toFood(updatedFood);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

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

  private toFood(food: PrismaFood): Food {
    return {
      category: food.category,
      createdAt: food.createdAt.toISOString(),
      id: food.id,
      name: food.name,
      notes: food.notes ?? undefined,
      status: food.status,
      suggestedServing: food.suggestedServing ?? undefined,
      tags: [...food.tags],
      tolerance: food.tolerance as Food["tolerance"],
      updatedAt: food.updatedAt.toISOString(),
    };
  }
}
