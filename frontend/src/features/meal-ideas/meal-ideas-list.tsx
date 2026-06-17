"use client";

import { useState } from "react";
import { Brain, ListChecks, Server, ShieldCheck, Sparkles } from "lucide-react";
import { MealIdeaCard } from "@/components/meal-ideas/meal-idea-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFoods } from "@/features/foods/foods-queries";
import { buildMealIdeas } from "@/features/meal-ideas/meal-ideas-generator";
import { useRecipes } from "@/features/recipes/recipes-queries";
import { env } from "@/lib/env";
import type { Food } from "@/lib/types/food";

type SuggestionMode = "basic" | "ai";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se han podido calcular las sugerencias.";
}

function getSafeFoods(foods: Food[]) {
  return foods.filter((food) => food.status === "allowed" && food.tolerance >= 4);
}

function getReasonableFoods(foods: Food[]) {
  return foods.filter(
    (food) =>
      food.status !== "avoid" &&
      food.status !== "caution" &&
      (food.status === "allowed" || food.tolerance >= 3),
  );
}

export function MealIdeasList() {
  const [mode, setMode] = useState<SuggestionMode>("basic");
  const foodsQuery = useFoods();
  const recipesQuery = useRecipes();
  const isLoading = foodsQuery.isLoading || recipesQuery.isLoading;
  const errors = [foodsQuery.error, recipesQuery.error].filter(Boolean);
  const foods = foodsQuery.data ?? [];
  const recipes = recipesQuery.data ?? [];
  const mealIdeas = buildMealIdeas({
    foods,
    recipes,
  });
  const safeFoods = getSafeFoods(foods);
  const reasonableFoods = getReasonableFoods(foods);
  const goodRecipes = recipes.filter((recipe) => recipe.rating && recipe.rating >= 4);
  const isAiMode = mode === "ai";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <h3 className="text-base font-semibold">Modo de sugerencia</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              El modo basico usa reglas locales. El modo IA queda preparado para generar
              recetas a partir de alimentos seguros y razonables.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-1">
            <Button
              type="button"
              variant={mode === "basic" ? "default" : "ghost"}
              onClick={() => setMode("basic")}
            >
              <ListChecks aria-hidden="true" />
              Sin IA
            </Button>
            <Button
              type="button"
              variant={mode === "ai" ? "default" : "ghost"}
              onClick={() => setMode("ai")}
            >
              <Brain aria-hidden="true" />
              IA avanzado
            </Button>
          </div>
        </div>
      </section>

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

      {isAiMode && !isLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Generacion avanzada con IA</CardTitle>
                <CardDescription>
                  Preparado para conectar un proveedor local o gratuito mas adelante.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Alimentos seguros</p>
                <p className="text-xl font-semibold">{safeFoods.length}</p>
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Alimentos razonables</p>
                <p className="text-xl font-semibold">{reasonableFoods.length}</p>
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Recetas bien valoradas</p>
                <p className="text-xl font-semibold">{goodRecipes.length}</p>
              </div>
            </div>

            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
              <span className="mb-1 inline-flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Validacion previa
              </span>
              <p>
                La IA solo deberia recibir alimentos permitidos o razonables y recetas
                existentes. Despues, la respuesta se validara contra tu lista antes de
                mostrarse como sugerencia.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Contexto que se usaria</p>
              <div className="flex flex-wrap gap-2">
                {safeFoods.slice(0, 10).map((food) => (
                  <Badge key={food.id} variant="secondary">
                    {food.name}
                  </Badge>
                ))}
                {safeFoods.length > 10 && (
                  <Badge variant="outline">+{safeFoods.length - 10} mas</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled>
                <Sparkles aria-hidden="true" />
                Generar con IA
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode("basic")}>
                Ver sugerencias sin IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Calculando sugerencias...
        </div>
      )}

      {!isLoading && mealIdeas.length > 0 && !isAiMode && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mealIdeas.map((mealIdea) => (
            <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
          ))}
        </section>
      )}

      {!isLoading && mealIdeas.length > 0 && isAiMode && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">Sugerencias base disponibles</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Estas ideas sin IA serviran como respaldo y como entrada segura para el modo
              avanzado.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mealIdeas.slice(0, 3).map((mealIdea) => (
              <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
            ))}
          </div>
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
