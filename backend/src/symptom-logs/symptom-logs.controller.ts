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
  findAll(): Promise<SymptomLog[]> {
    return this.symptomLogsService.findAll();
  }

  @Get(":id")
  @Permissions("symptom-logs:read")
  findOne(@Param("id") id: string): Promise<SymptomLog> {
    return this.symptomLogsService.findOne(id);
  }

  @Post()
  @Permissions("symptom-logs:create")
  create(
    @Body() createSymptomLogDto: CreateSymptomLogDto,
  ): Promise<SymptomLog> {
    return this.symptomLogsService.create(createSymptomLogDto);
  }

  @Patch(":id")
  @Permissions("symptom-logs:update")
  update(
    @Param("id") id: string,
    @Body() updateSymptomLogDto: UpdateSymptomLogDto,
  ): Promise<SymptomLog> {
    return this.symptomLogsService.update(id, updateSymptomLogDto);
  }

  @Delete(":id")
  @Permissions("symptom-logs:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.symptomLogsService.remove(id);
  }
}
