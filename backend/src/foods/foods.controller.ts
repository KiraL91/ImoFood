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
} from "@nestjs/common";

import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { FoodsService } from "./foods.service";
import type { Food, FoodStatus } from "./types/food";

@Controller("foods")
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
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
  findOne(@Param("id") id: string): Promise<Food> {
    return this.foodsService.findOne(id);
  }

  @Post()
  create(@Body() createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodsService.create(createFoodDto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateFoodDto: UpdateFoodDto,
  ): Promise<Food> {
    return this.foodsService.update(id, updateFoodDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.foodsService.remove(id);
  }
}
