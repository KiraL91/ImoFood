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
    @Req() request: AuthenticatedRequest,
    @Query("relatedMealLogId") relatedMealLogId?: string,
    @Query("relatedSymptomLogId") relatedSymptomLogId?: string,
    @Query("treatmentId") treatmentId?: string,
  ): Promise<TreatmentLog[]> {
    return this.treatmentLogsService.findAll(this.getRequestUserId(request), {
      relatedMealLogId,
      relatedSymptomLogId,
      treatmentId,
    });
  }

  @Get(":id")
  @Permissions("treatment-logs:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<TreatmentLog> {
    return this.treatmentLogsService.findOne(
      id,
      this.getRequestUserId(request),
    );
  }

  @Post()
  @Permissions("treatment-logs:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createTreatmentLogDto: CreateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    return this.treatmentLogsService.create(
      createTreatmentLogDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("treatment-logs:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateTreatmentLogDto: UpdateTreatmentLogDto,
  ): Promise<TreatmentLog> {
    return this.treatmentLogsService.update(
      id,
      updateTreatmentLogDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("treatment-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.treatmentLogsService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
