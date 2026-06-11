import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { FoodsModule } from "./foods/foods.module";

@Module({
  controllers: [AppController],
  imports: [AuthModule, FoodsModule],
})
export class AppModule {}
