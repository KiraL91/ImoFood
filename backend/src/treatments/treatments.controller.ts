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
import { CreateTreatmentDto } from "./dto/create-treatment.dto";
import { UpdateTreatmentDto } from "./dto/update-treatment.dto";
import { TreatmentsService } from "./treatments.service";
import type { Treatment } from "./types/treatment";

@Controller("treatments")
@UseGuards(AuthGuard, PermissionsGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  @Permissions("treatments:read")
  findAll(
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("target") target?: string,
  ): Promise<Treatment[]> {
    return this.treatmentsService.findAll({
      category,
      search,
      status,
      target,
    });
  }

  @Get(":id")
  @Permissions("treatments:read")
  findOne(@Param("id") id: string): Promise<Treatment> {
    return this.treatmentsService.findOne(id);
  }

  @Post()
  @Permissions("treatments:create")
  create(@Body() createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Patch(":id")
  @Permissions("treatments:update")
  update(
    @Param("id") id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ): Promise<Treatment> {
    return this.treatmentsService.update(id, updateTreatmentDto);
  }

  @Delete(":id")
  @Permissions("treatments:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.treatmentsService.remove(id);
  }
}
