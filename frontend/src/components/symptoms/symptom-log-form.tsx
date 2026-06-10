"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MealLog } from "@/lib/types/meal-log";
import type { SymptomLog } from "@/lib/types/symptom-log";
import { formatDateTime } from "@/lib/utils/format-date";

type SymptomLogFormProps = {
  mealLogs: MealLog[];
  onSubmit: (symptomLog: SymptomLog) => void;
};

type SymptomDraft = {
  loggedAt: string;
  bloating: number;
  pain: number;
  gas: number;
  transit: number;
  energy: number;
  sleep: number;
  notes: string;
  relatedMealLogId: string;
};

const scoreFields: Array<{
  key: keyof Pick<
    SymptomDraft,
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

const initialDraft: SymptomDraft = {
  loggedAt: "2026-06-10T12:30",
  bloating: 2,
  pain: 1,
  gas: 2,
  transit: 5,
  energy: 7,
  sleep: 6,
  notes: "",
  relatedMealLogId: "",
};

export function SymptomLogForm({ mealLogs, onSubmit }: SymptomLogFormProps) {
  const [draft, setDraft] = useState<SymptomDraft>(initialDraft);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      id: `symptom-log-local-${Date.now()}`,
      loggedAt: new Date(draft.loggedAt).toISOString(),
      bloating: draft.bloating,
      pain: draft.pain,
      gas: draft.gas,
      transit: draft.transit,
      energy: draft.energy,
      sleep: draft.sleep,
      notes: draft.notes || undefined,
      relatedMealLogId: draft.relatedMealLogId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setDraft(initialDraft);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2 text-sm font-medium">
        Fecha/hora
        <Input
          type="datetime-local"
          value={draft.loggedAt}
          onChange={(event) =>
            setDraft((current) => ({ ...current, loggedAt: event.target.value }))
          }
        />
      </label>

      <label className="space-y-2 text-sm font-medium">
        Comida relacionada opcional
        <select
          value={draft.relatedMealLogId}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              relatedMealLogId: event.target.value,
            }))
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Sin relacionar</option>
          {mealLogs.map((mealLog) => (
            <option key={mealLog.id} value={mealLog.id}>
              {mealLog.description} - {formatDateTime(mealLog.consumedAt)}
            </option>
          ))}
        </select>
      </label>

      {scoreFields.map((field) => (
        <label key={field.key} className="space-y-2 text-sm font-medium">
          <span className="flex items-center justify-between gap-3">
            {field.label}
            <span className="text-muted-foreground">{draft[field.key]}/10</span>
          </span>
          <input
            type="range"
            min="0"
            max="10"
            value={draft[field.key]}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [field.key]: Number(event.target.value),
              }))
            }
            className="w-full accent-[var(--primary)]"
          />
        </label>
      ))}

      <label className="space-y-2 text-sm font-medium md:col-span-2">
        Notas
        <textarea
          value={draft.notes}
          onChange={(event) =>
            setDraft((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Contexto, hora, estres, cantidad o cualquier patron relevante"
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      <div className="md:col-span-2">
        <Button type="submit">
          <Save aria-hidden="true" />
          Guardar entrada local
        </Button>
      </div>
    </form>
  );
}
