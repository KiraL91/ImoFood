import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SymptomLogsController } from "./symptom-logs.controller";
import { SymptomLogsService } from "./symptom-logs.service";

@Module({
  controllers: [SymptomLogsController],
  imports: [AuthModule, PrismaModule],
  providers: [SymptomLogsService],
})
export class SymptomLogsModule {}
