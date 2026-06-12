import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { FoodsModule } from "./foods/foods.module";
import { MealLogsModule } from "./meal-logs/meal-logs.module";
import { RecipesModule } from "./recipes/recipes.module";

@Module({
  controllers: [AppController],
  imports: [AuthModule, FoodsModule, RecipesModule, MealLogsModule],
})
export class AppModule {}
