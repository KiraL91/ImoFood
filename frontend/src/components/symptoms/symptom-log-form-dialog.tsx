"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateSymptomLogInput } from "@/features/symptoms/symptom-logs-api";
import type { SymptomLog } from "@/lib/types/symptom-log";

type SymptomLogFormState = {
  loggedAt: string;
  bloating: number;
  pain: number;
  gas: number;
  transit: number;
  energy: number;
  sleep: number;
  notes: string;
};

type SymptomLogFormDialogProps = {
  disabledReason?: string;
  errorMessage?: string | null;
  initialSymptomLog?: SymptomLog;
  isDisabled?: boolean;
  isOpen: boolean;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (input: CreateSymptomLogInput) => Promise<void> | void;
};

const scoreFields: Array<{
  key: keyof Pick<
    SymptomLogFormState,
    "bloating" | "pain" | "gas" | "transit" | "energy" | "sleep"
  >;
  label: string;
}> = [
  { key: "bloating", label: "Hinchazon" },
  { key: "pain", label: "Dolor" },
  { key: "gas", label: "Gases" },
  { key: "transit", label: "Transito" },
  { key: "energy", label: "Energia" },
  { key: "sleep", label: "Sueno" },
];

function toDateTimeLocalValue(iso?: string) {
  const date = iso ? new Date(iso) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getEmptyFormState(): SymptomLogFormState {
  return {
    loggedAt: toDateTimeLocalValue(),
    bloating: 2,
    pain: 1,
    gas: 2,
    transit: 5,
    energy: 7,
    sleep: 6,
    notes: "",
  };
}

function toFormState(symptomLog?: SymptomLog): SymptomLogFormState {
  if (!symptomLog) {
    return getEmptyFormState();
  }

  return {
    loggedAt: toDateTimeLocalValue(symptomLog.loggedAt),
    bloating: symptomLog.bloating,
    pain: symptomLog.pain,
    gas: symptomLog.gas,
    transit: symptomLog.transit,
    energy: symptomLog.energy,
    sleep: symptomLog.sleep,
    notes: symptomLog.notes ?? "",
  };
}

function toSymptomLogInput(
  formState: SymptomLogFormState,
  isEditing: boolean,
): CreateSymptomLogInput {
  return {
    bloating: formState.bloating,
    energy: formState.energy,
    gas: formState.gas,
    loggedAt: new Date(formState.loggedAt).toISOString(),
    notes: formState.notes.trim() || (isEditing ? null : undefined),
    pain: formState.pain,
    sleep: formState.sleep,
    transit: formState.transit,
  };
}

export function SymptomLogFormDialog({
  disabledReason,
  errorMessage,
  initialSymptomLog,
  isDisabled = false,
  isOpen,
  isSubmitting = false,
  mode = "create",
  onCancel,
  onOpenChange,
  onSubmit,
}: SymptomLogFormDialogProps) {
  const [formState, setFormState] = useState(() => toFormState(initialSymptomLog));
  const disabled = isDisabled || isSubmitting;
  const isEditing = mode === "edit";

  useEffect(() => {
    if (isOpen) {
      setFormState(toFormState(initialSymptomLog));
    }
  }, [initialSymptomLog, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit || disabled) {
      return;
    }

    await onSubmit(toSymptomLogInput(formState, isEditing));
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
      title={isEditing ? "Editar sintomas" : "Registrar sintomas"}
      description={
        isDisabled
          ? (disabledReason ?? "Tu rol no permite modificar sintomas.")
          : "Guarda una entrada con puntuaciones de 0 a 10."
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive md:col-span-2">
            {errorMessage}
          </div>
        )}

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Fecha/hora
          <Input
            value={formState.loggedAt}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                loggedAt: event.target.value,
              }))
            }
            type="datetime-local"
            disabled={disabled}
            required
          />
        </label>

        {scoreFields.map((field) => (
          <label key={field.key} className="space-y-2 text-sm font-medium">
            <span className="flex items-center justify-between gap-3">
              {field.label}
              <span className="text-muted-foreground">{formState[field.key]}/10</span>
            </span>
            <input
              type="range"
              min="0"
              max="10"
              value={formState[field.key]}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  [field.key]: Number(event.target.value),
                }))
              }
              className="w-full accent-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
            />
          </label>
        ))}

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Contexto, hora, estres, descanso o cualquier patron relevante"
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
                : "Guardar entrada"}
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
