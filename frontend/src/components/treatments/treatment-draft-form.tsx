import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  treatmentCategoryMeta,
  treatmentTimingMeta,
  treatmentStatusMeta,
  treatmentTargetLabels,
} from "@/lib/constants/treatments";
import type { MealLog } from "@/lib/types/meal-log";
import type { SymptomLog } from "@/lib/types/symptom-log";
import type {
  Treatment,
  TreatmentCategory,
  TreatmentLogTiming,
  TreatmentStatus,
  TreatmentTarget,
} from "@/lib/types/treatment";
import { formatDateTime } from "@/lib/utils/format-date";

type TreatmentDraftFormProps =
  | {
      mode: "treatment";
      treatments?: never;
      mealLogs?: never;
      symptomLogs?: never;
    }
  | {
      mode: "log";
      treatments: Treatment[];
      mealLogs: MealLog[];
      symptomLogs: SymptomLog[];
    };

const categoryOptions = Object.keys(treatmentCategoryMeta) as TreatmentCategory[];
const statusOptions = Object.keys(treatmentStatusMeta) as TreatmentStatus[];
const targetOptions = Object.keys(treatmentTargetLabels) as TreatmentTarget[];
const timingOptions = Object.keys(treatmentTimingMeta) as TreatmentLogTiming[];

export function TreatmentDraftForm(props: TreatmentDraftFormProps) {
  if (props.mode === "treatment") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm font-medium xl:col-span-2">
          Nombre
          <Input placeholder="Ej. Tratamiento pautado" />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Categoria
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {treatmentCategoryMeta[category].label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Estado
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {treatmentStatusMeta[status].label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Fecha inicio
          <Input type="date" defaultValue="2026-06-10" />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Fecha fin
          <Input type="date" />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Targets
          <select
            multiple
            className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
            defaultValue={["SIBO", "maintenance"]}
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
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Contexto de seguimiento, tolerancia o pauta indicada externamente"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-4">
          <Button type="button" disabled>
            <Save aria-hidden="true" />
            Guardar tratamiento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="space-y-2 text-sm font-medium">
        Tratamiento
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {props.treatments.map((treatment) => (
            <option key={treatment.id} value={treatment.id}>
              {treatment.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium">
        Fecha/hora
        <Input type="datetime-local" defaultValue="2026-06-10T21:30" />
      </label>

      <label className="space-y-2 text-sm font-medium">
        Dosis textual
        <Input placeholder="Ej. Segun pauta, 1 sobre, dosis habitual" />
      </label>

      <label className="space-y-2 text-sm font-medium">
        Momento de toma
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {timingOptions.map((timing) => (
            <option key={timing} value={timing}>
              {treatmentTimingMeta[timing]}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium md:col-span-2">
        Comida relacionada opcional
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Sin relacionar</option>
          {props.mealLogs.map((mealLog) => (
            <option key={mealLog.id} value={mealLog.id}>
              {mealLog.description} - {formatDateTime(mealLog.consumedAt)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium md:col-span-2">
        Sintomas relacionados opcionales
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Sin relacionar</option>
          {props.symptomLogs.map((symptomLog) => (
            <option key={symptomLog.id} value={symptomLog.id}>
              {formatDateTime(symptomLog.loggedAt)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium md:col-span-2 xl:col-span-4">
        Notas
        <textarea
          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Tolerancia, sintomas posteriores o contexto de la toma"
        />
      </label>

      <div className="md:col-span-2 xl:col-span-4">
        <Button type="button" disabled>
          <Save aria-hidden="true" />
          Guardar toma
        </Button>
      </div>
    </div>
  );
}
