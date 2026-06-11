import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import type { CreateFoodDto } from "./dto/create-food.dto";
import type { UpdateFoodDto } from "./dto/update-food.dto";
import { initialFoods } from "./mock/initial-foods";
import { FOOD_STATUSES, type Food, type FoodFilters } from "./types/food";

@Injectable()
export class FoodsService {
  private readonly foods = new Map<string, Food>(
    initialFoods.map((food) => [food.id, this.cloneFood(food)]),
  );

  findAll(filters: FoodFilters = {}): Food[] {
    this.assertValidStatus(filters.status);

    const search = filters.search?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const tag = filters.tag?.trim().toLowerCase();

    return Array.from(this.foods.values())
      .filter((food) => {
        if (filters.status && food.status !== filters.status) {
          return false;
        }

        if (category && food.category.toLowerCase() !== category) {
          return false;
        }

        if (
          tag &&
          !food.tags.some((foodTag) => foodTag.toLowerCase() === tag)
        ) {
          return false;
        }

        if (!search) {
          return true;
        }

        const searchableText = [
          food.name,
          food.category,
          food.notes,
          ...food.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(search);
      })
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((food) => this.cloneFood(food));
  }

  findOne(id: string): Food {
    const food = this.foods.get(id);

    if (!food) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }

    return this.cloneFood(food);
  }

  create(createFoodDto: CreateFoodDto): Food {
    const now = new Date().toISOString();
    const food: Food = {
      ...createFoodDto,
      id: randomUUID(),
      name: createFoodDto.name.trim(),
      category: createFoodDto.category.trim(),
      notes: createFoodDto.notes?.trim(),
      tags: this.normalizeTags(createFoodDto.tags),
      createdAt: now,
      updatedAt: now,
    };

    this.foods.set(food.id, food);

    return this.cloneFood(food);
  }

  update(id: string, updateFoodDto: UpdateFoodDto): Food {
    const currentFood = this.findOne(id);
    const now = new Date().toISOString();

    const updatedFood: Food = {
      ...currentFood,
      ...updateFoodDto,
      name: updateFoodDto.name?.trim() ?? currentFood.name,
      category: updateFoodDto.category?.trim() ?? currentFood.category,
      notes: updateFoodDto.notes?.trim() ?? currentFood.notes,
      tags: updateFoodDto.tags
        ? this.normalizeTags(updateFoodDto.tags)
        : currentFood.tags,
      updatedAt: now,
    };

    this.foods.set(id, updatedFood);

    return this.cloneFood(updatedFood);
  }

  remove(id: string): void {
    if (!this.foods.delete(id)) {
      throw new NotFoundException(`Food with id "${id}" was not found.`);
    }
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

  private cloneFood(food: Food): Food {
    return {
      ...food,
      tags: [...food.tags],
    };
  }
}
