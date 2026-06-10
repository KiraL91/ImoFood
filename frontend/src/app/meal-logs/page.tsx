import { MealLogsPanel } from "@/features/meal-logs/meal-logs-panel";
import { foods } from "@/lib/mock/foods";
import { mealLogs } from "@/lib/mock/meal-logs";
import { recipes } from "@/lib/mock/recipes";

export default function MealLogsPage() {
  return <MealLogsPanel foods={foods} mealLogs={mealLogs} recipes={recipes} />;
}
