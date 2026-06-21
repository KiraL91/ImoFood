import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { UpdateMeDto } from "./dto/update-me.dto";
import type { AuthenticatedRequest } from "./types/authenticated-user";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.getRequestUser(request);
  }

  @Patch("me")
  @UseGuards(AuthGuard)
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.authService.updateMe(
      this.getRequestUser(request).id,
      updateMeDto,
    );
  }

  @Patch("me/password")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      this.getRequestUser(request).id,
      changePasswordDto,
    );
  }

  private getRequestUser(request: AuthenticatedRequest) {
    if (!request.user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return request.user;
  }
}
