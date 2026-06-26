"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  existingFoods?: Food[];
  initialFood?: Food;
  isCheckingExistingFoods?: boolean;
  isDisabled?: boolean;
  isOpen: boolean;
  isSuggestingWithAi?: boolean;
  isSubmitting?: boolean;
  editScope?: "catalog" | "preference";
  mode?: "create" | "edit";
  onSuggestWithAi?: (input: SuggestFoodInfoInput) => Promise<AiFoodInfoSuggestion>;
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onViewExistingFood?: (food: Food) => void;
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

const emptyExistingFoods: Food[] = [];

const foodNameStopWords = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "los",
  "para",
  "por",
  "sin",
  "y",
]);

function getFoodNameTokens(value: string) {
  const normalizedValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (!normalizedValue) {
    return [];
  }

  return normalizedValue
    .split(/\s+/)
    .filter((token) => token.length > 0 && !foodNameStopWords.has(token));
}

function getComparableFoodName(value: string) {
  return getFoodNameTokens(value).join(" ");
}

function getRelatedFoods(name: string, foods: Food[]) {
  const nameTokens = getFoodNameTokens(name);
  const nameTokenSet = new Set(nameTokens);

  if (nameTokens.length === 0) {
    return [];
  }

  return foods
    .map((food) => {
      const foodTokens = getFoodNameTokens(food.name);
      const foodTokenSet = new Set(foodTokens);
      const sharedTokenCount = nameTokens.filter((token) =>
        foodTokenSet.has(token),
      ).length;

      return {
        food,
        score: sharedTokenCount * 10 - Math.abs(nameTokenSet.size - foodTokenSet.size),
        sharedTokenCount,
      };
    })
    .filter(({ sharedTokenCount }) => sharedTokenCount > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, 5)
    .map(({ food }) => food);
}

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
  existingFoods = emptyExistingFoods,
  initialFood,
  isCheckingExistingFoods = false,
  isDisabled = false,
  isOpen,
  isSuggestingWithAi = false,
  isSubmitting = false,
  editScope = "catalog",
  mode = "create",
  onSuggestWithAi,
  onCancel,
  onOpenChange,
  onViewExistingFood,
  onSubmit,
  suggestionDisabledReason,
}: FoodFormDialogProps) {
  const [formState, setFormState] = useState(() => toFormState(initialFood));
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestionFeedback, setSuggestionFeedback] = useState<string | null>(null);
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";
  const isPreferenceEdit = isEditing && editScope === "preference";
  const catalogFieldsDisabled = disabled || isPreferenceEdit;
  const isDuplicateCheckPending = !isEditing && isCheckingExistingFoods;
  const comparableFoodName = useMemo(
    () => getComparableFoodName(formState.name),
    [formState.name],
  );
  const foodsForDuplicateCheck = useMemo(
    () => existingFoods.filter((food) => food.id !== initialFood?.id),
    [existingFoods, initialFood?.id],
  );
  const exactExistingFood = useMemo(() => {
    if (isEditing || comparableFoodName.length === 0) {
      return undefined;
    }

    return foodsForDuplicateCheck.find(
      (food) => getComparableFoodName(food.name) === comparableFoodName,
    );
  }, [comparableFoodName, foodsForDuplicateCheck, isEditing]);
  const relatedFoods = useMemo(() => {
    if (isEditing || exactExistingFood || comparableFoodName.length === 0) {
      return [];
    }

    return getRelatedFoods(formState.name, foodsForDuplicateCheck);
  }, [
    comparableFoodName,
    exactExistingFood,
    foodsForDuplicateCheck,
    formState.name,
    isEditing,
  ]);
  const hasExactFoodNameDuplicate = Boolean(exactExistingFood);
  const canSuggestWithAi = !isEditing && Boolean(onSuggestWithAi);
  const suggestionButtonDisabled =
    disabled ||
    isDuplicateCheckPending ||
    hasExactFoodNameDuplicate ||
    !canSuggestWithAi ||
    isSuggestingWithAi ||
    formState.name.trim().length < 2;
  const submitButtonDisabled =
    disabled || isDuplicateCheckPending || hasExactFoodNameDuplicate;
  const suggestionButtonTitle = isDuplicateCheckPending
    ? "Comprobando alimentos existentes."
    : hasExactFoodNameDuplicate
      ? "Ya existe este alimento. Revisa su ficha antes de pedir IA."
      : !canSuggestWithAi
        ? (suggestionDisabledReason ?? "La sugerencia con IA no esta disponible.")
        : formState.name.trim().length < 2
          ? "Escribe primero el nombre del alimento."
          : "Rellenar campos con una propuesta de IA.";
  const dialogTitle = isPreferenceEdit
    ? "Editar preferencia"
    : isEditing
      ? "Editar alimento"
      : "Nuevo alimento";
  const dialogDescription = isDisabled
    ? (disabledReason ??
      "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend.")
    : isPreferenceEdit
      ? "Ajusta tu estado, tolerancia y notas para este alimento."
      : "Guarda alimentos y raciones sugeridas en la base de conocimiento.";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialFood));
      setSuggestionError(null);
      setSuggestionFeedback(null);
    }
  }, [initialFood, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || submitButtonDisabled) {
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
      title={dialogTitle}
      description={dialogDescription}
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
            disabled={catalogFieldsDisabled}
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
          {isDuplicateCheckPending && (
            <p className="text-xs font-normal leading-5 text-muted-foreground">
              Comprobando alimentos existentes...
            </p>
          )}
          {exactExistingFood && (
            <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-normal leading-5 text-destructive">
              <p>
                Ya existe un alimento equivalente:{" "}
                <span className="font-medium">{exactExistingFood.name}</span>.
              </p>
              {onViewExistingFood && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-destructive"
                  onClick={() => onViewExistingFood(exactExistingFood)}
                >
                  Ver alimento existente
                </Button>
              )}
            </div>
          )}
          {!exactExistingFood && relatedFoods.length > 0 && (
            <div className="space-y-2 rounded-md border bg-secondary/50 p-3 text-xs font-normal leading-5 text-muted-foreground">
              <p>Alimentos relacionados:</p>
              <div className="flex flex-wrap gap-2">
                {relatedFoods.map((food) => (
                  <Button
                    key={food.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onViewExistingFood?.(food)}
                  >
                    {food.name}
                  </Button>
                ))}
              </div>
            </div>
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
            disabled={catalogFieldsDisabled}
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
            disabled={catalogFieldsDisabled}
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
            disabled={catalogFieldsDisabled}
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
          <Button type="submit" disabled={submitButtonDisabled}>
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
