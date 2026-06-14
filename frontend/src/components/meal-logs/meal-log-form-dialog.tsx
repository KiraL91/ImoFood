"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateMealLogInput } from "@/features/meal-logs/meal-logs-api";
import type { MealLog } from "@/lib/types/meal-log";
import type { Recipe } from "@/lib/types/recipe";

type MealLogFormState = {
  consumedAt: string;
  description: string;
  notes: string;
  recipeId: string;
};

type MealLogFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialMealLog?: MealLog;
  initialRecipe?: Recipe;
  isDisabled?: boolean;
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

function getEmptyFormState(initialRecipe?: Recipe): MealLogFormState {
  return {
    consumedAt: toDateTimeLocalValue(),
    description: initialRecipe?.name ?? "",
    notes: "",
    recipeId: initialRecipe?.id ?? "",
  };
}

function toFormState(mealLog?: MealLog, initialRecipe?: Recipe): MealLogFormState {
  if (!mealLog) {
    return getEmptyFormState(initialRecipe);
  }

  return {
    consumedAt: toDateTimeLocalValue(mealLog.consumedAt),
    description: mealLog.description,
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
    notes: formState.notes.trim() || undefined,
    recipeId: formState.recipeId || (isEditing ? null : undefined),
  };
}

export function MealLogFormDialog({
  disabledReason,
  errorMessage,
  initialMealLog,
  initialRecipe,
  isDisabled = false,
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
    toFormState(initialMealLog, initialRecipe),
  );
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialMealLog, initialRecipe));
    }
  }, [initialMealLog, initialRecipe, isOpen]);

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar comida" : "Registrar comida"}
      description={
        isDisabled
          ? (disabledReason ?? "Tu rol no permite modificar el historial.")
          : "Guarda comidas consumidas en el historial."
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
          Receta asociada
          <select
            value={formState.recipeId}
            onChange={(event) => handleRecipeChange(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || isRecipesLoading}
          >
            <option value="">Sin receta asociada</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Descripcion
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
            placeholder="Contexto, cantidad aproximada o tolerancia percibida"
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
                : "Guardar comida"}
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
