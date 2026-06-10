import { recipeSchema, type Recipe } from "@/lib/types/recipe";

// Backend later: recipes will come from an API and user-created collections.
export const recipes: Recipe[] = recipeSchema.array().parse([
  {
    id: "recipe-001",
    name: "Bowl de arroz con pollo",
    description: "Comida base, sencilla y facil de ajustar por tolerancia.",
    ingredients: [
      "Arroz blanco cocido",
      "Pechuga de pollo",
      "Aceite de oliva",
      "Sal",
      "Zanahoria cocida opcional",
    ],
    steps: [
      "Cocer el arroz hasta que quede suelto.",
      "Dorar el pollo con poco aceite.",
      "Combinar y ajustar sal al final.",
    ],
    tags: ["comida", "base", "sin gluten"],
    prepTimeMinutes: 25,
    rating: 5,
  },
  {
    id: "recipe-002",
    name: "Tortilla suave",
    description: "Cena rapida con pocos ingredientes y buena saciedad.",
    ingredients: ["Huevos", "Sal", "Aceite de oliva"],
    steps: [
      "Batir los huevos con una pizca de sal.",
      "Cuajar a fuego medio con poco aceite.",
      "Servir con arroz o verdura tolerada.",
    ],
    tags: ["cena", "rapida", "proteina"],
    prepTimeMinutes: 10,
    rating: 4,
  },
  {
    id: "recipe-003",
    name: "Crema simple de calabacin",
    description: "Receta en fase de prueba para raciones pequenas.",
    ingredients: ["Calabacin pelado", "Agua", "Sal", "Aceite de oliva"],
    steps: [
      "Cocer el calabacin pelado hasta que este tierno.",
      "Triturar con parte del agua de coccion.",
      "Anadir aceite de oliva al servir.",
    ],
    tags: ["verdura", "fase prueba", "suave"],
    prepTimeMinutes: 20,
    rating: 3,
  },
]);
