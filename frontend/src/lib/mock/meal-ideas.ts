import { mealIdeaSchema, type MealIdea } from "@/lib/types/meal-idea";

// Backend later: this will be a queryable suggestion source, eventually IA-assisted.
export const mealIdeas: MealIdea[] = mealIdeaSchema.array().parse([
  {
    id: "idea-001",
    title: "Comida segura de base",
    items: ["Arroz blanco", "Pechuga de pollo", "Aceite de oliva"],
    reason: "Alta tolerancia y baja complejidad digestiva.",
    tags: ["seguro", "comida", "rapido"],
  },
  {
    id: "idea-002",
    title: "Cena ligera",
    items: ["Tortilla francesa", "Arroz blanco pequeno"],
    reason: "Pocos ingredientes y proteina facil de preparar.",
    tags: ["cena", "proteina", "simple"],
  },
  {
    id: "idea-003",
    title: "Prueba controlada",
    items: ["Crema de calabacin", "Pollo a la plancha"],
    reason: "Permite evaluar una verdura en racion pequena con base conocida.",
    tags: ["testing", "verdura", "observacion"],
  },
  {
    id: "idea-004",
    title: "Desayuno salado",
    items: ["Huevo", "Arroz blanco", "Aceite de oliva"],
    reason: "Alternativa sin lactosa ni fruta para dias sensibles.",
    tags: ["desayuno", "sin lactosa", "base"],
  },
]);
