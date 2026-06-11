"use client";

import { useMemo, useState } from "react";
import { Search, Server } from "lucide-react";
import { FoodCard } from "@/components/foods/food-card";
import { NewFoodDraftCard } from "@/components/foods/new-food-draft-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateFoodInput } from "@/features/foods/foods-api";
import {
  useCreateFood,
  useDeleteFood,
  useFoods,
  useUpdateFood,
} from "@/features/foods/foods-queries";
import { foodStatusMeta, foodStatusOrder } from "@/lib/constants/status";
import { env } from "@/lib/env";
import type { Food, FoodStatus } from "@/lib/types/food";
import { cn } from "@/lib/utils/cn";

type FilterValue = FoodStatus | "all";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function FoodsExplorer() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterValue>("all");
  const [editingFood, setEditingFood] = useState<Food | undefined>();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const foodsQuery = useFoods();
  const createFoodMutation = useCreateFood();
  const updateFoodMutation = useUpdateFood();
  const deleteFoodMutation = useDeleteFood();
  const foods = useMemo(() => foodsQuery.data ?? [], [foodsQuery.data]);
  const isSubmitting = createFoodMutation.isPending || updateFoodMutation.isPending;

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foods.filter((food) => {
      const matchesStatus = status === "all" || food.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [food.name, food.category, food.notes, ...food.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [foods, query, status]);

  async function handleFoodSubmit(input: CreateFoodInput) {
    setMutationError(null);

    try {
      if (editingFood) {
        await updateFoodMutation.mutateAsync({
          id: editingFood.id,
          input,
        });
        setEditingFood(undefined);
        return;
      }

      await createFoodMutation.mutateAsync(input);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleDeleteFood(food: Food) {
    const confirmed = window.confirm(`Borrar "${food.name}" de la base de conocimiento?`);

    if (!confirmed) {
      return;
    }

    setMutationError(null);

    try {
      await deleteFoodMutation.mutateAsync(food.id);

      if (editingFood?.id === food.id) {
        setEditingFood(undefined);
      }
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-5">
      <NewFoodDraftCard
        initialFood={editingFood}
        isDisabled={!hasBackendConfigured}
        isSubmitting={isSubmitting}
        mode={editingFood ? "edit" : "create"}
        onCancel={() => setEditingFood(undefined)}
        onSubmit={handleFoodSubmit}
      />

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando datos mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      {mutationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {foodsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(foodsQuery.error)}
        </div>
      )}

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar alimento, categoria o etiqueta"
              className="pl-9"
              aria-label="Buscar alimentos"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={status === "all" ? "default" : "outline"}
              onClick={() => setStatus("all")}
            >
              Todos
            </Button>
            {foodStatusOrder.map((foodStatus) => {
              const meta = foodStatusMeta[foodStatus];

              return (
                <Button
                  key={foodStatus}
                  type="button"
                  size="sm"
                  variant={status === foodStatus ? "default" : "outline"}
                  onClick={() => setStatus(foodStatus)}
                >
                  <span
                    className={cn("size-2 rounded-full", meta.dotClassName)}
                    aria-hidden="true"
                  />
                  {meta.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {foodsQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando alimentos...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredFoods.map((food) => (
          <FoodCard
            key={food.id}
            canMutate={hasBackendConfigured}
            food={food}
            isDeleting={
              deleteFoodMutation.isPending && deleteFoodMutation.variables === food.id
            }
            onDelete={handleDeleteFood}
            onEdit={setEditingFood}
          />
        ))}
      </section>

      {!foodsQuery.isLoading && filteredFoods.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay alimentos que coincidan con el filtro actual.
        </div>
      )}
    </div>
  );
}
