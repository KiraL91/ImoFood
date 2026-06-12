import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MealLogsController } from "./meal-logs.controller";
import { MealLogsService } from "./meal-logs.service";

@Module({
  controllers: [MealLogsController],
  imports: [AuthModule, PrismaModule],
  providers: [MealLogsService],
})
export class MealLogsModule {}
