import { Module } from "@nestjs/common";

import { FoodsController } from "./foods.controller";
import { FoodsService } from "./foods.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  controllers: [FoodsController],
  imports: [PrismaModule],
  providers: [FoodsService],
})
export class FoodsModule {}
