import { mealLogSchema, type MealLog } from "@/lib/types/meal-log";

// Backend later: replace this list with GET /meal-logs and POST /meal-logs.
export const mealLogs: MealLog[] = mealLogSchema.array().parse([
  {
    id: "meal-log-001",
    consumedAt: "2026-06-10T08:15:00.000Z",
    description: "Desayuno salado con huevo y arroz blanco",
    recipeId: "recipe-002",
    foodIds: ["food-001", "food-004"],
    notes: "Racion pequena, sin cafe. Buena saciedad.",
    createdAt: "2026-06-10T08:20:00.000Z",
    updatedAt: "2026-06-10T08:20:00.000Z",
  },
  {
    id: "meal-log-002",
    consumedAt: "2026-06-09T13:45:00.000Z",
    description: "Bowl de arroz con pollo",
    recipeId: "recipe-001",
    foodIds: ["food-001", "food-002"],
    notes: "Comida segura antes de una tarde con reuniones.",
    createdAt: "2026-06-09T14:00:00.000Z",
    updatedAt: "2026-06-09T14:00:00.000Z",
  },
  {
    id: "meal-log-003",
    consumedAt: "2026-06-08T20:10:00.000Z",
    description: "Prueba controlada con crema de calabacin",
    recipeId: "recipe-003",
    foodIds: ["food-002", "food-003"],
    notes: "Media racion de calabacin, observar sintomas nocturnos.",
    createdAt: "2026-06-08T20:30:00.000Z",
    updatedAt: "2026-06-08T20:30:00.000Z",
  },
]);
