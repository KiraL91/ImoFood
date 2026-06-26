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
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import type { AuthenticatedRequest } from "../auth/types/authenticated-user";
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
    @Req() request: AuthenticatedRequest,
    @Query("search") search?: string,
    @Query("ingredient") ingredient?: string,
    @Query("tag") tag?: string,
    @Query("minRating") minRating?: string,
  ): Promise<Recipe[]> {
    return this.recipesService.findAll(this.getRequestUserId(request), {
      ingredient,
      minRating,
      search,
      tag,
    });
  }

  @Get(":id")
  @Permissions("recipes:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<Recipe> {
    return this.recipesService.findOne(id, this.getRequestUserId(request));
  }

  @Post()
  @Permissions("recipes:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.create(
      createRecipeDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("recipes:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(
      id,
      updateRecipeDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("recipes:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.recipesService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
