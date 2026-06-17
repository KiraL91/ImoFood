"use client";

import { Server } from "lucide-react";
import { MealIdeaCard } from "@/components/meal-ideas/meal-idea-card";
import { useFoods } from "@/features/foods/foods-queries";
import { buildMealIdeas } from "@/features/meal-ideas/meal-ideas-generator";
import { useRecipes } from "@/features/recipes/recipes-queries";
import { env } from "@/lib/env";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se han podido calcular las sugerencias.";
}

export function MealIdeasList() {
  const foodsQuery = useFoods();
  const recipesQuery = useRecipes();
  const isLoading = foodsQuery.isLoading || recipesQuery.isLoading;
  const errors = [foodsQuery.error, recipesQuery.error].filter(Boolean);
  const mealIdeas = buildMealIdeas({
    foods: foodsQuery.data ?? [],
    recipes: recipesQuery.data ?? [],
  });

  return (
    <div className="space-y-5">
      {!env.NEXT_PUBLIC_API_BASE_URL && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando sugerencias generadas desde mocks. Configura
            NEXT_PUBLIC_API_BASE_URL para usar alimentos y recetas reales.
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(errors[0])}
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Calculando sugerencias...
        </div>
      )}

      {!isLoading && mealIdeas.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mealIdeas.map((mealIdea) => (
            <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
          ))}
        </section>
      )}

      {!isLoading && mealIdeas.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay sugerencias suficientes todavia. Anade alimentos permitidos y recetas con
          ingredientes reconocibles para generar ideas sin IA.
        </div>
      )}
    </div>
  );
}
