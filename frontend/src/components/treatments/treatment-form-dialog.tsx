"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateTreatmentInput } from "@/features/treatments/treatments-api";
import {
  treatmentCategoryMeta,
  treatmentStatusMeta,
  treatmentTargetLabels,
} from "@/lib/constants/treatments";
import type {
  Treatment,
  TreatmentCategory,
  TreatmentStatus,
  TreatmentTarget,
} from "@/lib/types/treatment";

type TreatmentFormState = {
  category: TreatmentCategory;
  endDate: string;
  name: string;
  notes: string;
  startDate: string;
  status: TreatmentStatus;
  targets: TreatmentTarget[];
};

type TreatmentFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialTreatment?: Treatment;
  isDisabled?: boolean;
  isOpen: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateTreatmentInput) => Promise<void> | void;
};

const categoryOptions = Object.keys(treatmentCategoryMeta) as TreatmentCategory[];
const statusOptions = Object.keys(treatmentStatusMeta) as TreatmentStatus[];
const targetOptions = Object.keys(treatmentTargetLabels) as TreatmentTarget[];

const emptyFormState: TreatmentFormState = {
  category: "supplement",
  endDate: "",
  name: "",
  notes: "",
  startDate: "",
  status: "active",
  targets: ["maintenance"],
};

function toFormState(treatment?: Treatment): TreatmentFormState {
  if (!treatment) {
    return emptyFormState;
  }

  return {
    category: treatment.category,
    endDate: treatment.endDate ?? "",
    name: treatment.name,
    notes: treatment.notes ?? "",
    startDate: treatment.startDate ?? "",
    status: treatment.status,
    targets: treatment.targets,
  };
}

function toTreatmentInput(formState: TreatmentFormState): CreateTreatmentInput {
  return {
    category: formState.category,
    endDate: formState.endDate || undefined,
    name: formState.name.trim(),
    notes: formState.notes.trim() || undefined,
    startDate: formState.startDate || undefined,
    status: formState.status,
    targets: formState.targets,
  };
}

export function TreatmentFormDialog({
  disabledReason,
  errorMessage,
  initialTreatment,
  isDisabled = false,
  isOpen,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onOpenChange,
  onSubmit,
}: TreatmentFormDialogProps) {
  const [formState, setFormState] = useState(() => toFormState(initialTreatment));
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialTreatment));
    }
  }, [initialTreatment, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toTreatmentInput(formState));
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
      title={isEditing ? "Editar tratamiento" : "Nuevo tratamiento"}
      description={
        isDisabled
          ? (disabledReason ??
            "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend.")
          : "Guarda tratamientos y su estado para el seguimiento diario."
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
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Ej. Probiótico pautado"
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Categoria
          <select
            value={formState.category}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                category: event.target.value as TreatmentCategory,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {treatmentCategoryMeta[category].label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Estado
          <select
            value={formState.status}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                status: event.target.value as TreatmentStatus,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {treatmentStatusMeta[status].label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Fecha inicio
          <Input
            type="date"
            value={formState.startDate}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                startDate: event.target.value,
              }))
            }
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Fecha fin
          <Input
            type="date"
            value={formState.endDate}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                endDate: event.target.value,
              }))
            }
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Objetivos
          <select
            multiple
            value={formState.targets}
            onChange={(event) => {
              const targets = Array.from(event.target.selectedOptions).map(
                (option) => option.value as TreatmentTarget,
              );

              setFormState((current) => ({
                ...current,
                targets,
              }));
            }}
            className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            required
          >
            {targetOptions.map((target) => (
              <option key={target} value={target}>
                {treatmentTargetLabels[target]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2 xl:col-span-4">
          Notas
          <textarea
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Contexto de seguimiento, tolerancia o pauta indicada externamente"
            disabled={disabled}
          />
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
          <Button type="submit" disabled={disabled || formState.targets.length === 0}>
            {isEditing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar tratamiento"}
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
