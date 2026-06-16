"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateMealLogInput } from "@/features/meal-logs/meal-logs-api";
import type { Food } from "@/lib/types/food";
import type { MealLog } from "@/lib/types/meal-log";
import type { Recipe } from "@/lib/types/recipe";

type MealLogFormState = {
  consumedAt: string;
  description: string;
  foodIds: string[];
  notes: string;
  recipeId: string;
};

type MealLogFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  foods?: Food[];
  initialMealLog?: MealLog;
  initialFood?: Food;
  initialRecipe?: Recipe;
  isDisabled?: boolean;
  isFoodsLoading?: boolean;
  isOpen: boolean;
  isRecipesLoading?: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateMealLogInput) => Promise<void> | void;
  recipes?: Recipe[];
};

function toDateTimeLocalValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getEmptyFormState(initialRecipe?: Recipe, initialFood?: Food): MealLogFormState {
  return {
    consumedAt: toDateTimeLocalValue(),
    description: initialRecipe?.name ?? initialFood?.name ?? "",
    foodIds: initialFood ? [initialFood.id] : [],
    notes: "",
    recipeId: initialRecipe?.id ?? "",
  };
}

function toFormState(
  mealLog?: MealLog,
  initialRecipe?: Recipe,
  initialFood?: Food,
): MealLogFormState {
  if (!mealLog) {
    return getEmptyFormState(initialRecipe, initialFood);
  }

  return {
    consumedAt: toDateTimeLocalValue(mealLog.consumedAt),
    description: mealLog.description,
    foodIds: mealLog.foodIds ?? mealLog.foods?.map((food) => food.id) ?? [],
    notes: mealLog.notes ?? "",
    recipeId: mealLog.recipeId ?? "",
  };
}

function toMealLogInput(
  formState: MealLogFormState,
  isEditing: boolean,
): CreateMealLogInput {
  return {
    consumedAt: new Date(formState.consumedAt).toISOString(),
    description: formState.description.trim(),
    foodIds: formState.foodIds,
    notes: formState.notes.trim() || undefined,
    recipeId: formState.recipeId || (isEditing ? null : undefined),
  };
}

export function MealLogFormDialog({
  disabledReason,
  errorMessage,
  foods = [],
  initialMealLog,
  initialFood,
  initialRecipe,
  isDisabled = false,
  isFoodsLoading = false,
  isOpen,
  isRecipesLoading = false,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onOpenChange,
  onSubmit,
  recipes = [],
}: MealLogFormDialogProps) {
  const [formState, setFormState] = useState(() =>
    toFormState(initialMealLog, initialRecipe, initialFood),
  );
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";
  const selectedFoods = formState.foodIds
    .map((foodId) => foods.find((food) => food.id === foodId))
    .filter((food): food is Food => Boolean(food));
  const availableFoods = foods.filter((food) => !formState.foodIds.includes(food.id));

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialMealLog, initialRecipe, initialFood));
    }
  }, [initialFood, initialMealLog, initialRecipe, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toMealLogInput(formState, isEditing));
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onCancel?.();
    }

    onOpenChange(open);
  }

  function handleRecipeChange(recipeId: string) {
    const selectedRecipe = recipes.find((recipe) => recipe.id === recipeId);

    setFormState((current) => ({
      ...current,
      description:
        !isEditing && selectedRecipe ? selectedRecipe.name : current.description,
      recipeId,
    }));
  }

  function handleFoodAdd(foodId: string) {
    if (!foodId) {
      return;
    }

    const selectedFood = foods.find((food) => food.id === foodId);

    if (!selectedFood) {
      return;
    }

    setFormState((current) => {
      if (current.foodIds.includes(foodId)) {
        return current;
      }

      return {
        ...current,
        description:
          !isEditing && !current.description.trim()
            ? selectedFood.name
            : current.description,
        foodIds: [...current.foodIds, foodId],
      };
    });
  }

  function handleFoodRemove(foodId: string) {
    setFormState((current) => ({
      ...current,
      foodIds: current.foodIds.filter((currentFoodId) => currentFoodId !== foodId),
    }));
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar ingesta" : "Registrar ingesta"}
      description={
        isDisabled
          ? (disabledReason ?? "Tu rol no permite modificar el historial.")
          : "Guarda que comiste y cuando. Los sintomas se registran aparte si aparecen."
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:col-span-2">
            {errorMessage}
          </div>
        )}

        <label className="space-y-2 text-sm font-medium">
          Fecha/hora
          <Input
            value={formState.consumedAt}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                consumedAt: event.target.value,
              }))
            }
            type="datetime-local"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Receta de origen
          <select
            value={formState.recipeId}
            onChange={(event) => handleRecipeChange(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || isRecipesLoading}
          >
            <option value="">Sin receta de origen</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2 text-sm font-medium md:col-span-2">
          Alimentos consumidos
          <select
            value=""
            onChange={(event) => handleFoodAdd(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || isFoodsLoading || availableFoods.length === 0}
          >
            <option value="">
              {availableFoods.length > 0
                ? "Anadir alimento a la ingesta"
                : "No hay mas alimentos disponibles"}
            </option>
            {availableFoods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.name} - {food.category}
              </option>
            ))}
          </select>
          {selectedFoods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFoods.map((food) => (
                <Button
                  key={food.id}
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => handleFoodRemove(food.id)}
                >
                  {food.name}
                  <X aria-hidden="true" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <label className="space-y-2 text-sm font-medium">
          Que comiste
          <Input
            value={formState.description}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Ej. Arroz blanco con pollo"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Cantidad aproximada, contexto o cambios relevantes"
            disabled={disabled}
          />
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" disabled={disabled}>
            {isEditing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar ingesta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            <X aria-hidden="true" />
            Cancelar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
