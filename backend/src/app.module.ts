import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { FoodsModule } from "./foods/foods.module";
import { MealLogsModule } from "./meal-logs/meal-logs.module";
import { RecipesModule } from "./recipes/recipes.module";
import { SymptomLogsModule } from "./symptom-logs/symptom-logs.module";
import { TreatmentsModule } from "./treatments/treatments.module";

@Module({
  controllers: [AppController],
  imports: [
    AiModule,
    AuthModule,
    FoodsModule,
    RecipesModule,
    MealLogsModule,
    SymptomLogsModule,
    TreatmentsModule,
  ],
})
export class AppModule {}
