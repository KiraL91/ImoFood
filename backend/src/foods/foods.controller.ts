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
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodPreferenceDto } from "./dto/update-food-preference.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { FoodsService } from "./foods.service";
import type { Food, FoodStatus } from "./types/food";

@Controller("foods")
@UseGuards(AuthGuard, PermissionsGuard)
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  @Permissions("foods:read")
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query("search") search?: string,
    @Query("status") status?: FoodStatus,
    @Query("category") category?: string,
    @Query("tag") tag?: string,
  ): Promise<Food[]> {
    return this.foodsService.findAll(this.getRequestUserId(request), {
      category,
      search,
      status,
      tag,
    });
  }

  @Get(":id")
  @Permissions("foods:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<Food> {
    return this.foodsService.findOne(id, this.getRequestUserId(request));
  }

  @Post()
  @Permissions("foods:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createFoodDto: CreateFoodDto,
  ): Promise<Food> {
    return this.foodsService.create(
      createFoodDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("foods:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ): Promise<Food> {
    return this.foodsService.update(
      id,
      updateFoodDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id/preference")
  @Permissions("food-preferences:update")
  updatePreference(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateFoodPreferenceDto: UpdateFoodPreferenceDto,
  ): Promise<Food> {
    return this.foodsService.updatePreference(
      id,
      updateFoodPreferenceDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("foods:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.foodsService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
