"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateRecipeInput } from "@/features/recipes/recipes-api";
import type { Recipe, RecipeRatingValue } from "@/lib/types/recipe";

type RecipeFormState = {
  description: string;
  ingredients: string;
  name: string;
  prepTimeMinutes: string;
  rating: "" | "1" | "2" | "3" | "4" | "5";
  steps: string;
  tags: string;
};

type RecipeFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialRecipe?: Recipe;
  isDisabled?: boolean;
  isOpen: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateRecipeInput) => Promise<void> | void;
};

const emptyFormState: RecipeFormState = {
  description: "",
  ingredients: "",
  name: "",
  prepTimeMinutes: "20",
  rating: "",
  steps: "",
  tags: "",
};

function toFormState(recipe?: Recipe): RecipeFormState {
  if (!recipe) {
    return emptyFormState;
  }

  return {
    description: recipe.description ?? "",
    ingredients: recipe.ingredients.join(", "),
    name: recipe.name,
    prepTimeMinutes: String(recipe.prepTimeMinutes),
    rating: recipe.rating ? (String(recipe.rating) as RecipeFormState["rating"]) : "",
    steps: recipe.steps?.join("\n") ?? "",
    tags: recipe.tags.join(", "),
  };
}

function splitCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLineList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toRecipeInput(formState: RecipeFormState): CreateRecipeInput {
  return {
    description: formState.description.trim() || undefined,
    ingredients: splitCommaList(formState.ingredients),
    name: formState.name.trim(),
    prepTimeMinutes: Number(formState.prepTimeMinutes),
    rating: formState.rating
      ? (Number(formState.rating) as RecipeRatingValue)
      : undefined,
    steps: splitLineList(formState.steps),
    tags: splitCommaList(formState.tags),
  };
}

export function RecipeFormDialog({
  disabledReason,
  errorMessage,
  initialRecipe,
  isDisabled = false,
  isOpen,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onOpenChange,
  onSubmit,
}: RecipeFormDialogProps) {
  const [formState, setFormState] = useState(() => toFormState(initialRecipe));
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialRecipe));
    }
  }, [initialRecipe, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toRecipeInput(formState));
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onCancel?.();
    }

    onOpenChange(open);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar receta" : "Nueva receta"}
      description={
        isDisabled
          ? (disabledReason ?? "Tu rol no permite modificar recetas.")
          : "Guarda preparaciones reutilizables en la API de recetas."
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:col-span-2 xl:col-span-4">
            {errorMessage}
          </div>
        )}

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Nombre
          <Input
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ej. Bowl de arroz con pollo"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Tiempo
          <Input
            value={formState.prepTimeMinutes}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                prepTimeMinutes: event.target.value,
              }))
            }
            type="number"
            min={1}
            placeholder="20"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Puntuacion
          <select
            value={formState.rating}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                rating: event.target.value as RecipeFormState["rating"],
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            <option value="">Sin puntuar</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Ingredientes
          <Input
            value={formState.ingredients}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                ingredients: event.target.value,
              }))
            }
            placeholder="Arroz blanco, pollo, aceite de oliva"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Tags
          <Input
            value={formState.tags}
            onChange={(event) =>
              setFormState((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="comida, base, sin gluten"
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Descripcion
          <textarea
            value={formState.description}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Uso, contexto o tolerancia esperada"
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Pasos
          <textarea
            value={formState.steps}
            onChange={(event) =>
              setFormState((current) => ({ ...current, steps: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Un paso por linea"
            disabled={disabled}
          />
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
          <Button type="submit" disabled={disabled}>
            {isEditing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar receta"}
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
