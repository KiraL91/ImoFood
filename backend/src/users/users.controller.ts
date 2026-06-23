import {
  Body,
  Controller,
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
import { CreateUserDto } from "./dto/create-user.dto";
import { ResetUserPasswordDto } from "./dto/reset-user-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import type { User } from "./types/user";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions("users:read")
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Post()
  @Permissions("users:create")
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Patch(":id")
  @Permissions("users:update")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/disable")
  @Permissions("users:disable")
  disable(@Param("id") id: string): Promise<User> {
    return this.usersService.disable(id);
  }

  @Patch(":id/enable")
  @Permissions("users:enable")
  enable(@Param("id") id: string): Promise<User> {
    return this.usersService.enable(id);
  }

  @Patch(":id/password")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions("users:reset-password")
  resetPassword(
    @Param("id") id: string,
    @Body() resetUserPasswordDto: ResetUserPasswordDto,
  ): Promise<void> {
    return this.usersService.resetPassword(id, resetUserPasswordDto);
  }
}
