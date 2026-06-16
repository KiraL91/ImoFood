import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TreatmentLogsController } from "./treatment-logs.controller";
import { TreatmentLogsService } from "./treatment-logs.service";
import { TreatmentsController } from "./treatments.controller";
import { TreatmentsService } from "./treatments.service";

@Module({
  controllers: [TreatmentsController, TreatmentLogsController],
  imports: [AuthModule, PrismaModule],
  providers: [TreatmentsService, TreatmentLogsService],
})
export class TreatmentsModule {}
