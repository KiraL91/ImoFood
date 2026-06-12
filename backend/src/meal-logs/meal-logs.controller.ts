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
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import { CreateMealLogDto } from "./dto/create-meal-log.dto";
import { UpdateMealLogDto } from "./dto/update-meal-log.dto";
import { MealLogsService } from "./meal-logs.service";
import type { MealLog } from "./types/meal-log";

@Controller("meal-logs")
@UseGuards(AuthGuard, PermissionsGuard)
export class MealLogsController {
  constructor(private readonly mealLogsService: MealLogsService) {}

  @Get()
  @Permissions("meal-logs:read")
  findAll(): Promise<MealLog[]> {
    return this.mealLogsService.findAll();
  }

  @Get(":id")
  @Permissions("meal-logs:read")
  findOne(@Param("id") id: string): Promise<MealLog> {
    return this.mealLogsService.findOne(id);
  }

  @Post()
  @Permissions("meal-logs:create")
  create(@Body() createMealLogDto: CreateMealLogDto): Promise<MealLog> {
    return this.mealLogsService.create(createMealLogDto);
  }

  @Patch(":id")
  @Permissions("meal-logs:update")
  update(
    @Param("id") id: string,
    @Body() updateMealLogDto: UpdateMealLogDto,
  ): Promise<MealLog> {
    return this.mealLogsService.update(id, updateMealLogDto);
  }

  @Delete(":id")
  @Permissions("meal-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.mealLogsService.remove(id);
  }
}
