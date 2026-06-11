"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Database, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CreateFoodInput } from "@/features/foods/foods-api";
import type { Food, FoodStatus } from "@/lib/types/food";

type FoodFormState = {
  category: string;
  name: string;
  notes: string;
  status: FoodStatus;
  tags: string;
  tolerance: "1" | "2" | "3" | "4" | "5";
};

type NewFoodDraftCardProps = {
  disabledReason?: string;
  initialFood?: Food;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSubmit?: (input: CreateFoodInput) => Promise<void> | void;
};

const emptyFormState: FoodFormState = {
  category: "",
  name: "",
  notes: "",
  status: "allowed",
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
    tags: formState.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    tolerance: Number(formState.tolerance) as CreateFoodInput["tolerance"],
  };
}

export function NewFoodDraftCard({
  disabledReason,
  initialFood,
  isDisabled = false,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onSubmit,
}: NewFoodDraftCardProps) {
  const [formState, setFormState] = useState(() => toFormState(initialFood));
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    setFormState(toFormState(initialFood));
  }, [initialFood]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toFoodInput(formState));

    if (!isEditing) {
      setFormState(emptyFormState);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Database className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>{isEditing ? "Editar alimento" : "Nuevo alimento"}</CardTitle>
            <CardDescription>
              {isDisabled
                ? (disabledReason ??
                  "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend.")
                : "Guarda cambios en la API local de alimentos."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <label className="space-y-2 text-sm font-medium">
            Nombre
            <Input
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Ej. Pavo cocido"
              disabled={disabled}
              required
            />
          </label>

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
                  : "Guardar en base de conocimiento"}
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
