import { mealLogSchema, type MealLog } from "@/lib/types/meal-log";

// Backend later: replace this list with GET /meal-logs and POST /meal-logs.
export const mealLogs: MealLog[] = mealLogSchema.array().parse([
  {
    id: "meal-log-001",
    consumedAt: "2026-06-10T08:15:00.000Z",
    description: "Desayuno salado con huevo y arroz blanco",
    notes: "Racion pequena, sin cafe. Buena saciedad.",
    foodIds: ["food-004", "food-001"],
    foods: [
      {
        id: "food-004",
        name: "Huevo",
        category: "Proteina",
        status: "allowed",
      },
      {
        id: "food-001",
        name: "Arroz blanco",
        category: "Cereal",
        status: "allowed",
      },
    ],
    createdAt: "2026-06-10T08:20:00.000Z",
    updatedAt: "2026-06-10T08:20:00.000Z",
  },
  {
    id: "meal-log-002",
    consumedAt: "2026-06-09T13:45:00.000Z",
    description: "Bowl de arroz con pollo",
    notes: "Comida segura antes de una tarde con reuniones.",
    recipeId: "recipe-001",
    foodIds: ["food-001", "food-002"],
    foods: [
      {
        id: "food-001",
        name: "Arroz blanco",
        category: "Cereal",
        status: "allowed",
      },
      {
        id: "food-002",
        name: "Pechuga de pollo",
        category: "Proteina",
        status: "allowed",
      },
    ],
    recipe: {
      id: "recipe-001",
      name: "Bowl de arroz con pollo",
    },
    createdAt: "2026-06-09T14:00:00.000Z",
    updatedAt: "2026-06-09T14:00:00.000Z",
  },
  {
    id: "meal-log-003",
    consumedAt: "2026-06-08T20:10:00.000Z",
    description: "Prueba controlada con crema de calabacin",
    notes: "Media racion de calabacin, observar sintomas nocturnos.",
    foodIds: ["food-003"],
    foods: [
      {
        id: "food-003",
        name: "Calabacin",
        category: "Verdura",
        status: "testing",
      },
    ],
    createdAt: "2026-06-08T20:30:00.000Z",
    updatedAt: "2026-06-08T20:30:00.000Z",
  },
]);
