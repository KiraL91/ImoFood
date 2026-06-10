"use client";

import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
import { MealLogCard } from "@/components/meal-logs/meal-log-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Food } from "@/lib/types/food";
import type { MealLog } from "@/lib/types/meal-log";
import type { Recipe } from "@/lib/types/recipe";

type MealLogsPanelProps = {
  mealLogs: MealLog[];
  foods: Food[];
  recipes: Recipe[];
};

export function MealLogsPanel({ mealLogs, foods, recipes }: MealLogsPanelProps) {
  const [isDraftVisible, setIsDraftVisible] = useState(false);

  const foodNameById = useMemo(
    () => new Map(foods.map((food) => [food.id, food.name])),
    [foods],
  );
  const recipeNameById = useMemo(
    () => new Map(recipes.map((recipe) => [recipe.id, recipe.name])),
    [recipes],
  );

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Historial de comidas</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Comidas registradas para correlacionar con sintomas.
          </p>
        </div>
        <Button type="button" onClick={() => setIsDraftVisible((value) => !value)}>
          <Plus aria-hidden="true" />
          Registrar comida
        </Button>
      </section>

      {isDraftVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo registro de comida</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Fecha/hora
              <Input type="datetime-local" defaultValue="2026-06-10T13:30" />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Receta asociada
              <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Sin receta</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium md:col-span-2">
              Descripcion
              <Input defaultValue="Comida simple pendiente de guardar" />
            </label>
            <label className="space-y-2 text-sm font-medium md:col-span-2">
              Notas
              <textarea
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                defaultValue="Este formulario es visual hasta conectar POST /meal-logs."
              />
            </label>
            <div className="md:col-span-2">
              <Button type="button" disabled>
                <Save aria-hidden="true" />
                Guardar local
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mealLogs.map((mealLog) => (
          <MealLogCard
            key={mealLog.id}
            mealLog={mealLog}
            recipeName={
              mealLog.recipeId ? recipeNameById.get(mealLog.recipeId) : undefined
            }
            foodNames={mealLog.foodIds?.flatMap((foodId) => {
              const foodName = foodNameById.get(foodId);

              return foodName ? [foodName] : [];
            })}
          />
        ))}
      </section>
    </div>
  );
}
