import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { PermissionsGuard } from "./permissions.guard";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [AuthController],
  exports: [AuthGuard, AuthService, PermissionsGuard],
  imports: [PrismaModule],
  providers: [AuthGuard, AuthService, PermissionsGuard],
})
export class AuthModule {}
