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
import { CreateSymptomLogDto } from "./dto/create-symptom-log.dto";
import { UpdateSymptomLogDto } from "./dto/update-symptom-log.dto";
import { SymptomLogsService } from "./symptom-logs.service";
import type { SymptomLog } from "./types/symptom-log";

@Controller("symptom-logs")
@UseGuards(AuthGuard, PermissionsGuard)
export class SymptomLogsController {
  constructor(private readonly symptomLogsService: SymptomLogsService) {}

  @Get()
  @Permissions("symptom-logs:read")
  findAll(@Req() request: AuthenticatedRequest): Promise<SymptomLog[]> {
    return this.symptomLogsService.findAll(this.getRequestUserId(request));
  }

  @Get(":id")
  @Permissions("symptom-logs:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<SymptomLog> {
    return this.symptomLogsService.findOne(id, this.getRequestUserId(request));
  }

  @Post()
  @Permissions("symptom-logs:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createSymptomLogDto: CreateSymptomLogDto,
  ): Promise<SymptomLog> {
    return this.symptomLogsService.create(
      createSymptomLogDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("symptom-logs:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateSymptomLogDto: UpdateSymptomLogDto,
  ): Promise<SymptomLog> {
    return this.symptomLogsService.update(
      id,
      updateSymptomLogDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("symptom-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.symptomLogsService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
