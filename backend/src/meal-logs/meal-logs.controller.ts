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
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import type { AuthenticatedRequest } from "../auth/types/authenticated-user";
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
  findAll(@Req() request: AuthenticatedRequest): Promise<MealLog[]> {
    return this.mealLogsService.findAll(this.getRequestUserId(request));
  }

  @Get(":id")
  @Permissions("meal-logs:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<MealLog> {
    return this.mealLogsService.findOne(id, this.getRequestUserId(request));
  }

  @Post()
  @Permissions("meal-logs:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createMealLogDto: CreateMealLogDto,
  ): Promise<MealLog> {
    return this.mealLogsService.create(
      createMealLogDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("meal-logs:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateMealLogDto: UpdateMealLogDto,
  ): Promise<MealLog> {
    return this.mealLogsService.update(
      id,
      updateMealLogDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("meal-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.mealLogsService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
