"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateTreatmentLogInput } from "@/features/treatments/treatments-api";
import { treatmentTimingMeta } from "@/lib/constants/treatments";
import type { MealLog } from "@/lib/types/meal-log";
import type { SymptomLog } from "@/lib/types/symptom-log";
import type { Treatment, TreatmentLog, TreatmentLogTiming } from "@/lib/types/treatment";
import { formatDateTime } from "@/lib/utils/format-date";

type TreatmentLogFormState = {
  dose: string;
  notes: string;
  relatedMealLogId: string;
  relatedSymptomLogId: string;
  takenAt: string;
  timing: TreatmentLogTiming;
  treatmentId: string;
};

type TreatmentLogFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialTreatmentLog?: TreatmentLog;
  isDisabled?: boolean;
  isOpen: boolean;
  isSubmitting?: boolean;
  mealLogs: MealLog[];
  mode?: "create" | "edit";
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateTreatmentLogInput) => Promise<void> | void;
  symptomLogs: SymptomLog[];
  treatments: Treatment[];
};

const timingOptions = Object.keys(treatmentTimingMeta) as TreatmentLogTiming[];

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toEmptyFormState(treatments: Treatment[]): TreatmentLogFormState {
  return {
    dose: "",
    notes: "",
    relatedMealLogId: "",
    relatedSymptomLogId: "",
    takenAt: toDateTimeLocalValue(new Date()),
    timing: "with-meal",
    treatmentId:
      treatments.find((treatment) => treatment.status === "active")?.id ??
      treatments[0]?.id ??
      "",
  };
}

function toFormState(
  treatments: Treatment[],
  treatmentLog?: TreatmentLog,
): TreatmentLogFormState {
  if (!treatmentLog) {
    return toEmptyFormState(treatments);
  }

  return {
    dose: treatmentLog.dose ?? "",
    notes: treatmentLog.notes ?? "",
    relatedMealLogId: treatmentLog.relatedMealLogId ?? "",
    relatedSymptomLogId: treatmentLog.relatedSymptomLogId ?? "",
    takenAt: toDateTimeLocalValue(new Date(treatmentLog.takenAt)),
    timing: treatmentLog.timing ?? "with-meal",
    treatmentId: treatmentLog.treatmentId,
  };
}

function toTreatmentLogInput(formState: TreatmentLogFormState): CreateTreatmentLogInput {
  return {
    dose: formState.dose.trim() || undefined,
    notes: formState.notes.trim() || undefined,
    relatedMealLogId: formState.relatedMealLogId || undefined,
    relatedSymptomLogId: formState.relatedSymptomLogId || undefined,
    takenAt: new Date(formState.takenAt).toISOString(),
    timing: formState.timing,
    treatmentId: formState.treatmentId,
  };
}

export function TreatmentLogFormDialog({
  disabledReason,
  errorMessage,
  initialTreatmentLog,
  isDisabled = false,
  isOpen,
  isSubmitting = false,
  mealLogs,
  mode = "create",
  onCancel,
  onOpenChange,
  onSubmit,
  symptomLogs,
  treatments,
}: TreatmentLogFormDialogProps) {
  const initialFormState = useMemo(
    () => toFormState(treatments, initialTreatmentLog),
    [initialTreatmentLog, treatments],
  );
  const [formState, setFormState] = useState(initialFormState);
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
    }
  }, [initialFormState, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled || !formState.treatmentId) {
      return;
    }

    await onSubmit(toTreatmentLogInput(formState));
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
      title={isEditing ? "Editar toma" : "Registrar toma"}
      description={
        isDisabled
          ? (disabledReason ??
            "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend.")
          : isEditing
            ? "Actualiza la toma registrada y sus relaciones de seguimiento."
            : "Registra una toma para poder cruzarla despues con comidas y sintomas."
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:col-span-2 xl:col-span-4">
            {errorMessage}
          </div>
        )}

        <label className="space-y-2 text-sm font-medium">
          Tratamiento
          <select
            value={formState.treatmentId}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                treatmentId: event.target.value,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || treatments.length === 0}
            required
          >
            {treatments.map((treatment) => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Fecha/hora
          <Input
            type="datetime-local"
            value={formState.takenAt}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                takenAt: event.target.value,
              }))
            }
            disabled={disabled}
            required
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Dosis textual
          <Input
            value={formState.dose}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                dose: event.target.value,
              }))
            }
            placeholder="Ej. 1 capsula, 1 sobre, pauta habitual"
            disabled={disabled}
          />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Momento
          <select
            value={formState.timing}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                timing: event.target.value as TreatmentLogTiming,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            {timingOptions.map((timing) => (
              <option key={timing} value={timing}>
                {treatmentTimingMeta[timing]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Comida relacionada opcional
          <select
            value={formState.relatedMealLogId}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                relatedMealLogId: event.target.value,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            <option value="">Sin relacionar</option>
            {mealLogs.map((mealLog) => (
              <option key={mealLog.id} value={mealLog.id}>
                {mealLog.description} - {formatDateTime(mealLog.consumedAt)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Sintomas relacionados opcionales
          <select
            value={formState.relatedSymptomLogId}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                relatedSymptomLogId: event.target.value,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            <option value="">Sin relacionar</option>
            {symptomLogs.map((symptomLog) => (
              <option key={symptomLog.id} value={symptomLog.id}>
                {formatDateTime(symptomLog.loggedAt)}
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
            placeholder="Tolerancia, sintomas posteriores o contexto de la toma"
            disabled={disabled}
          />
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-4">
          <Button
            type="submit"
            disabled={disabled || !formState.treatmentId || treatments.length === 0}
          >
            {isEditing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Guardar toma"}
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
