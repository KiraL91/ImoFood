import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Recipe as PrismaRecipe } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateRecipeDto } from "./dto/create-recipe.dto";
import type { UpdateRecipeDto } from "./dto/update-recipe.dto";
import type { Recipe, RecipeFilters, RecipeRatingValue } from "./types/recipe";

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: RecipeFilters = {}): Promise<Recipe[]> {
    const search = filters.search?.trim().toLowerCase();
    const ingredient = filters.ingredient?.trim();
    const tag = filters.tag?.trim().toLowerCase();
    const minRating = this.parseMinRating(filters.minRating);
    const where: Prisma.RecipeWhereInput = {};

    if (ingredient) {
      where.ingredients = {
        has: ingredient,
      };
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (minRating) {
      where.rating = {
        gte: minRating,
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
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          ingredients: {
            has: search,
          },
        },
        {
          tags: {
            has: search,
          },
        },
      ];
    }

    const recipes = await this.prisma.recipe.findMany({
      orderBy: {
        name: "asc",
      },
      where,
    });

    return recipes.map((recipe) => this.toRecipe(recipe));
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${id}" was not found.`);
    }

    return this.toRecipe(recipe);
  }

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    const recipe = await this.prisma.recipe.create({
      data: {
        description: createRecipeDto.description?.trim(),
        ingredients: this.normalizeList(createRecipeDto.ingredients),
        name: createRecipeDto.name.trim(),
        prepTimeMinutes: createRecipeDto.prepTimeMinutes,
        rating: createRecipeDto.rating,
        steps: this.normalizeList(createRecipeDto.steps ?? []),
        tags: this.normalizeList(createRecipeDto.tags),
      },
    });

    return this.toRecipe(recipe);
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    await this.findOne(id);

    const data: Prisma.RecipeUpdateInput = {
      description: updateRecipeDto.description?.trim(),
      ingredients: updateRecipeDto.ingredients
        ? this.normalizeList(updateRecipeDto.ingredients)
        : undefined,
      name: updateRecipeDto.name?.trim(),
      prepTimeMinutes: updateRecipeDto.prepTimeMinutes,
      rating: updateRecipeDto.rating,
      steps: updateRecipeDto.steps
        ? this.normalizeList(updateRecipeDto.steps)
        : undefined,
      tags: updateRecipeDto.tags
        ? this.normalizeList(updateRecipeDto.tags)
        : undefined,
    };

    const updatedRecipe = await this.prisma.recipe.update({
      data,
      where: {
        id,
      },
    });

    return this.toRecipe(updatedRecipe);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.recipe.delete({
      where: {
        id,
      },
    });
  }

  private normalizeList(items: string[]): string[] {
    return Array.from(
      new Set(
        items.map((item) => item.trim()).filter((item) => item.length > 0),
      ),
    );
  }

  private parseMinRating(minRating?: string): RecipeRatingValue | undefined {
    if (!minRating) {
      return undefined;
    }

    const parsed = Number(minRating);

    if (![1, 2, 3, 4, 5].includes(parsed)) {
      throw new BadRequestException(
        'Invalid minRating. Expected one of: "1", "2", "3", "4", "5".',
      );
    }

    return parsed as RecipeRatingValue;
  }

  private toRecipe(recipe: PrismaRecipe): Recipe {
    return {
      createdAt: recipe.createdAt.toISOString(),
      description: recipe.description ?? undefined,
      id: recipe.id,
      ingredients: [...recipe.ingredients],
      name: recipe.name,
      prepTimeMinutes: recipe.prepTimeMinutes,
      rating: recipe.rating ? (recipe.rating as Recipe["rating"]) : undefined,
      steps: recipe.steps.length > 0 ? [...recipe.steps] : undefined,
      tags: [...recipe.tags],
      updatedAt: recipe.updatedAt.toISOString(),
    };
  }
}
