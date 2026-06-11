import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { FoodsController } from "./foods.controller";
import { FoodsService } from "./foods.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [FoodsController],
  imports: [AuthModule, PrismaModule],
  providers: [FoodsService],
})
export class FoodsModule {}
