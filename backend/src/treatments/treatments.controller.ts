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
    @Req() request: AuthenticatedRequest,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("target") target?: string,
  ): Promise<Treatment[]> {
    return this.treatmentsService.findAll(this.getRequestUserId(request), {
      category,
      search,
      status,
      target,
    });
  }

  @Get(":id")
  @Permissions("treatments:read")
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<Treatment> {
    return this.treatmentsService.findOne(id, this.getRequestUserId(request));
  }

  @Post()
  @Permissions("treatments:create")
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createTreatmentDto: CreateTreatmentDto,
  ): Promise<Treatment> {
    return this.treatmentsService.create(
      createTreatmentDto,
      this.getRequestUserId(request),
    );
  }

  @Patch(":id")
  @Permissions("treatments:update")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() updateTreatmentDto: UpdateTreatmentDto,
  ): Promise<Treatment> {
    return this.treatmentsService.update(
      id,
      updateTreatmentDto,
      this.getRequestUserId(request),
    );
  }

  @Delete(":id")
  @Permissions("treatments:delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<void> {
    await this.treatmentsService.remove(id, this.getRequestUserId(request));
  }

  private getRequestUserId(request: AuthenticatedRequest): string {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user.id;
  }
}
