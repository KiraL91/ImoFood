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
import { CreateFoodDto } from "./dto/create-food.dto";
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
    @Query("search") search?: string,
    @Query("status") status?: FoodStatus,
    @Query("category") category?: string,
    @Query("tag") tag?: string,
  ): Promise<Food[]> {
    return this.foodsService.findAll({
      category,
      search,
      status,
      tag,
    });
  }

  @Get(":id")
  @Permissions("foods:read")
  findOne(@Param("id") id: string): Promise<Food> {
    return this.foodsService.findOne(id);
  }

  @Post()
  @Permissions("foods:create")
  create(@Body() createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodsService.create(createFoodDto);
  }

  @Patch(":id")
  @Permissions("foods:update")
  update(
    @Param("id") id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ): Promise<Food> {
    return this.foodsService.update(id, updateFoodDto);
  }

  @Delete(":id")
  @Permissions("foods:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.foodsService.remove(id);
  }
}
