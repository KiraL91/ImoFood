"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateMealLogInput } from "@/features/meal-logs/meal-logs-api";
import type { MealLog } from "@/lib/types/meal-log";

type MealLogFormState = {
  consumedAt: string;
  description: string;
  notes: string;
};

type MealLogDraftCardProps = {
  disabledReason?: string;
  initialMealLog?: MealLog;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmit?: (input: CreateMealLogInput) => Promise<void> | void;
};

function toDateTimeLocalValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getEmptyFormState(): MealLogFormState {
  return {
    consumedAt: toDateTimeLocalValue(),
    description: "",
    notes: "",
  };
}

function toFormState(mealLog?: MealLog): MealLogFormState {
  if (!mealLog) {
    return getEmptyFormState();
  }

  return {
    consumedAt: toDateTimeLocalValue(mealLog.consumedAt),
    description: mealLog.description,
    notes: mealLog.notes ?? "",
  };
}

function toMealLogInput(formState: MealLogFormState): CreateMealLogInput {
  return {
    consumedAt: new Date(formState.consumedAt).toISOString(),
    description: formState.description.trim(),
    notes: formState.notes.trim() || undefined,
  };
}

export function MealLogDraftCard({
  disabledReason,
  initialMealLog,
  isDisabled = false,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onSubmit,
}: MealLogDraftCardProps) {
  const [formState, setFormState] = useState(() => toFormState(initialMealLog));
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    setFormState(toFormState(initialMealLog));
  }, [initialMealLog]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toMealLogInput(formState));

    if (!isEditing) {
      setFormState(getEmptyFormState());
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Utensils className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>{isEditing ? "Editar comida" : "Registrar comida"}</CardTitle>
            <CardDescription>
              {isDisabled
                ? (disabledReason ?? "Tu rol no permite modificar el historial.")
                : "Guarda comidas consumidas en el historial."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
            {isEditing && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X aria-hidden="true" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
