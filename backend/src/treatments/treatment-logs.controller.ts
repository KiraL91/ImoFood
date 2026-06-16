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
import { CreateTreatmentLogDto } from "./dto/create-treatment-log.dto";
import { UpdateTreatmentLogDto } from "./dto/update-treatment-log.dto";
import { TreatmentLogsService } from "./treatment-logs.service";
import type { TreatmentLog } from "./types/treatment";

@Controller("treatment-logs")
@UseGuards(AuthGuard, PermissionsGuard)
export class TreatmentLogsController {
  constructor(private readonly treatmentLogsService: TreatmentLogsService) {}

  @Get()
  @Permissions("treatment-logs:read")
  findAll(
    @Query("relatedMealLogId") relatedMealLogId?: string,
    @Query("relatedSymptomLogId") relatedSymptomLogId?: string,
    @Query("treatmentId") treatmentId?: string,
  ): Promise<TreatmentLog[]> {
    return this.treatmentLogsService.findAll({
      relatedMealLogId,
      relatedSymptomLogId,
      treatmentId,
    });
  }

  @Get(":id")
  @Permissions("treatment-logs:read")
  findOne(@Param("id") id: string): Promise<TreatmentLog> {
    return this.treatmentLogsService.findOne(id);
  }

  @Post()
  @Permissions("treatment-logs:create")
  create(
    @Body() createTreatmentLogDto: CreateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    return this.treatmentLogsService.create(createTreatmentLogDto);
  }

  @Patch(":id")
  @Permissions("treatment-logs:update")
  update(
    @Param("id") id: string,
    @Body() updateTreatmentLogDto: UpdateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    return this.treatmentLogsService.update(id, updateTreatmentLogDto);
  }

  @Delete(":id")
  @Permissions("treatment-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.treatmentLogsService.remove(id);
  }
}
