import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { FoodsModule } from "./foods/foods.module";

@Module({
  controllers: [AppController],
  imports: [FoodsModule],
})
export class AppModule {}
