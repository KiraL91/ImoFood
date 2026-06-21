"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Save, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  AiFoodInfoSuggestion,
  CreateFoodInput,
  SuggestFoodInfoInput,
} from "@/features/foods/foods-api";
import type { Food, FoodStatus } from "@/lib/types/food";

type FoodFormState = {
  category: string;
  name: string;
  notes: string;
  status: FoodStatus;
  suggestedServing: string;
  tags: string;
  tolerance: "1" | "2" | "3" | "4" | "5";
};

type FoodFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialFood?: Food;
  isDisabled?: boolean;
  isOpen: boolean;
  isSuggestingWithAi?: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onSuggestWithAi?: (input: SuggestFoodInfoInput) => Promise<AiFoodInfoSuggestion>;
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateFoodInput) => Promise<void> | void;
  suggestionDisabledReason?: string;
};

const emptyFormState: FoodFormState = {
  category: "",
  name: "",
  notes: "",
  status: "allowed",
  suggestedServing: "",
  tags: "",
  tolerance: "5",
};

function toFormState(food?: Food): FoodFormState {
  if (!food) {
    return emptyFormState;
  }

  return {
    category: food.category,
    name: food.name,
    notes: food.notes ?? "",
    status: food.status,
    suggestedServing: food.suggestedServing ?? "",
    tags: food.tags.join(", "),
    tolerance: String(food.tolerance) as FoodFormState["tolerance"],
  };
}

function toFoodInput(formState: FoodFormState): CreateFoodInput {
  return {
    category: formState.category.trim(),
    name: formState.name.trim(),
    notes: formState.notes.trim() || undefined,
    status: formState.status,
    suggestedServing: formState.suggestedServing.trim(),
    tags: formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    tolerance: Number(formState.tolerance) as CreateFoodInput["tolerance"],
  };
}

function getTagsFromInput(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido generar la sugerencia.";
}

export function FoodFormDialog({
  disabledReason,
  errorMessage,
  initialFood,
  isDisabled = false,
  isOpen,
  isSuggestingWithAi = false,
  isSubmitting = false,
  mode = "create",
  onSuggestWithAi,
  onCancel,
  onOpenChange,
  onSubmit,
  suggestionDisabledReason,
}: FoodFormDialogProps) {
  const [formState, setFormState] = useState(() => toFormState(initialFood));
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestionFeedback, setSuggestionFeedback] = useState<string | null>(null);
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";
  const canSuggestWithAi = !isEditing && Boolean(onSuggestWithAi);
  const suggestionButtonDisabled =
    disabled ||
    !canSuggestWithAi ||
    isSuggestingWithAi ||
    formState.name.trim().length < 2;
  const suggestionButtonTitle = !canSuggestWithAi
    ? (suggestionDisabledReason ?? "La sugerencia con IA no esta disponible.")
    : formState.name.trim().length < 2
      ? "Escribe primero el nombre del alimento."
      : "Rellenar campos con una propuesta de IA.";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialFood));
      setSuggestionError(null);
      setSuggestionFeedback(null);
    }
  }, [initialFood, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toFoodInput(formState));
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onCancel?.();
    }

    onOpenChange(open);
  }

  async function handleSuggestWithAi() {
    if (!onSuggestWithAi || suggestionButtonDisabled) {
      return;
    }

    setSuggestionError(null);
    setSuggestionFeedback(null);

    try {
      const suggestion = await onSuggestWithAi({
        category: formState.category.trim() || undefined,
        name: formState.name.trim(),
        notes: formState.notes.trim() || undefined,
        tags: getTagsFromInput(formState.tags),
      });

      setFormState((current) => ({
        ...current,
        category: suggestion.category,
        notes: suggestion.notes ?? current.notes,
        status: suggestion.status,
        suggestedServing: suggestion.suggestedServing,
        tags: suggestion.tags.join(", "),
        tolerance: String(suggestion.tolerance) as FoodFormState["tolerance"],
      }));
      setSuggestionFeedback("Sugerencia aplicada. Revisa los campos antes de guardar.");
    } catch (error) {
      setSuggestionError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar alimento" : "Nuevo alimento"}
      description={
        isDisabled
          ? (disabledReason ??
            "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend.")
          : "Guarda alimentos y raciones sugeridas en la base de conocimiento."
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:col-span-2 xl:col-span-4">
            {errorMessage}
          </div>
        )}

        <div className="space-y-2 text-sm font-medium">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="food-name">Nombre</label>
            {!isEditing && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={suggestionButtonDisabled}
                title={suggestionButtonTitle}
                onClick={handleSuggestWithAi}
              >
                {isSuggestingWithAi ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles aria-hidden="true" />
                )}
                {isSuggestingWithAi ? "Sugiriendo..." : "Sugerir con IA"}
              </Button>
            )}
          </div>
          <Input
            id="food-name"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ej. Pavo cocido"
            disabled={disabled}
            required
          />
          {suggestionError && (
            <p className="text-xs font-normal leading-5 text-destructive">
              {suggestionError}
            </p>
          )}
          {suggestionFeedback && (
            <p className="text-xs font-normal leading-5 text-muted-foreground">
              {suggestionFeedback}
            </p>
          )}
        </div>

        <label className="space-y-2 text-sm font-medium">
          Categoria
          <Input
            value={formState.category}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            placeholder="Proteina, verdura, fruta..."
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Estado
          <select
            value={formState.status}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                status: event.target.value as FoodStatus,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            <option value="allowed">Permitido</option>
            <option value="testing">En prueba</option>
            <option value="caution">Dudoso</option>
            <option value="avoid">Prohibido</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Tolerancia
          <select
            value={formState.tolerance}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                tolerance: event.target.value as FoodFormState["tolerance"],
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            <option value="5">5 - Muy buena</option>
            <option value="4">4 - Buena</option>
            <option value="3">3 - Media</option>
            <option value="2">2 - Baja</option>
            <option value="1">1 - Mala</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Tags
          <Input
            value={formState.tags}
            onChange={(event) =>
              setFormState((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="base, rapido, sin gluten"
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Racion sugerida
          <Input
            value={formState.suggestedServing}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                suggestedServing: event.target.value,
              }))
            }
            placeholder="Ej. 50 g, equivale a medio aguacate de tamano medio"
            disabled={disabled}
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
            placeholder="Observaciones de tolerancia, porcion o fase"
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
                : "Guardar alimento"}
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
