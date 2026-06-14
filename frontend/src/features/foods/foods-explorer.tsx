"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Server } from "lucide-react";
import { FoodCard } from "@/components/foods/food-card";
import { FoodFormDialog } from "@/components/foods/food-form-dialog";
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
import { useAuth } from "@/providers/auth-provider";

type FilterValue = FoodStatus | "all";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function FoodsExplorer() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterValue>("all");
  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | undefined>();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateFood = hasPermission("foods:create");
  const canUpdateFood = hasPermission("foods:update");
  const canDeleteFood = hasPermission("foods:delete");
  const foodsQuery = useFoods();
  const createFoodMutation = useCreateFood();
  const updateFoodMutation = useUpdateFood();
  const deleteFoodMutation = useDeleteFood();
  const foods = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (foodsQuery.data ?? [])),
    [foodsQuery.data, hasBackendConfigured, isAuthenticated],
  );
  const isSubmitting = createFoodMutation.isPending || updateFoodMutation.isPending;
  const isFormDisabled =
    !hasBackendConfigured ||
    !isAuthenticated ||
    (editingFood ? !canUpdateFood : !canCreateFood);
  const canOpenCreateDialog = hasBackendConfigured && isAuthenticated && canCreateFood;
  const disabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para usar el CRUD real de alimentos."
      : editingFood
        ? "Tu rol no permite editar alimentos."
        : "Tu rol no permite crear alimentos.";

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foods.filter((food) => {
      const matchesStatus = status === "all" || food.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [food.name, food.category, food.notes, food.suggestedServing, ...food.tags]
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
        setIsFoodDialogOpen(false);
        return;
      }

      await createFoodMutation.mutateAsync(input);
      setIsFoodDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  function handleOpenCreateFoodDialog() {
    setMutationError(null);
    setEditingFood(undefined);
    setIsFoodDialogOpen(true);
  }

  function handleOpenEditFoodDialog(food: Food) {
    setMutationError(null);
    setEditingFood(food);
    setIsFoodDialogOpen(true);
  }

  function handleFoodDialogOpenChange(open: boolean) {
    setIsFoodDialogOpen(open);

    if (!open) {
      setEditingFood(undefined);
      setMutationError(null);
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
      <FoodFormDialog
        disabledReason={disabledReason}
        errorMessage={mutationError}
        initialFood={editingFood}
        isDisabled={isFormDisabled}
        isOpen={isFoodDialogOpen}
        isSubmitting={isSubmitting}
        mode={editingFood ? "edit" : "create"}
        onCancel={() => {
          setEditingFood(undefined);
          setMutationError(null);
        }}
        onOpenChange={handleFoodDialogOpenChange}
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

      {hasBackendConfigured && !isAuthenticated && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Inicia sesion en /login para consultar alimentos desde el backend con
            permisos.
          </p>
        </div>
      )}

      {mutationError && !isFoodDialogOpen && (
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="space-y-4">
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

          <Button
            type="button"
            className="w-full xl:w-auto"
            disabled={!canOpenCreateDialog}
            title={canOpenCreateDialog ? "Anadir alimento" : disabledReason}
            onClick={handleOpenCreateFoodDialog}
          >
            <Plus aria-hidden="true" />
            Anadir alimento
          </Button>
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
            canDelete={hasBackendConfigured && isAuthenticated && canDeleteFood}
            canEdit={hasBackendConfigured && isAuthenticated && canUpdateFood}
            food={food}
            isDeleting={
              deleteFoodMutation.isPending && deleteFoodMutation.variables === food.id
            }
            onDelete={handleDeleteFood}
            onEdit={handleOpenEditFoodDialog}
          />
        ))}
      </section>

      {!foodsQuery.isLoading && filteredFoods.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay alimentos que coincidan con el filtro actual.
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateDialog}
        title={canOpenCreateDialog ? "Anadir alimento" : disabledReason}
        aria-label="Anadir alimento"
        onClick={handleOpenCreateFoodDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
