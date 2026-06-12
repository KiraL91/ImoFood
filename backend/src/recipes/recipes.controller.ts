import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import { CreateRecipeDto } from "./dto/create-recipe.dto";
import { UpdateRecipeDto } from "./dto/update-recipe.dto";
import { RecipesService } from "./recipes.service";
import type { Recipe } from "./types/recipe";

@Controller("recipes")
@UseGuards(AuthGuard, PermissionsGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @Permissions("recipes:read")
  findAll(
    @Query("search") search?: string,
    @Query("ingredient") ingredient?: string,
    @Query("tag") tag?: string,
    @Query("minRating") minRating?: string,
  ): Promise<Recipe[]> {
    return this.recipesService.findAll({
      ingredient,
      minRating,
      search,
      tag,
    });
  }

  @Get(":id")
  @Permissions("recipes:read")
  findOne(@Param("id") id: string): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }

  @Post()
  @Permissions("recipes:create")
  create(@Body() createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesService.create(createRecipeDto);
  }

  @Patch(":id")
  @Permissions("recipes:update")
  update(
    @Param("id") id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(":id")
  @Permissions("recipes:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.recipesService.remove(id);
  }
}
