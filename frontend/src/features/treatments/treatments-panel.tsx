"use client";

import { useMemo, useState } from "react";
import { Plus, Stethoscope } from "lucide-react";
import { TreatmentCard } from "@/components/treatments/treatment-card";
import { TreatmentDraftForm } from "@/components/treatments/treatment-draft-form";
import { TreatmentLogCard } from "@/components/treatments/treatment-log-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealLog } from "@/lib/types/meal-log";
import type { SymptomLog } from "@/lib/types/symptom-log";
import type { Treatment, TreatmentLog } from "@/lib/types/treatment";

type TreatmentsPanelProps = {
  mealLogs: MealLog[];
  symptomLogs: SymptomLog[];
  treatmentLogs: TreatmentLog[];
  treatments: Treatment[];
};

export function TreatmentsPanel({
  mealLogs,
  symptomLogs,
  treatmentLogs,
  treatments,
}: TreatmentsPanelProps) {
  const [visibleDraft, setVisibleDraft] = useState<"treatment" | "log" | null>(null);

  const treatmentNameById = useMemo(
    () => new Map(treatments.map((treatment) => [treatment.id, treatment.name])),
    [treatments],
  );
  const mealDescriptionById = useMemo(
    () => new Map(mealLogs.map((mealLog) => [mealLog.id, mealLog.description])),
    [mealLogs],
  );
  const symptomDateById = useMemo(
    () => new Map(symptomLogs.map((symptomLog) => [symptomLog.id, symptomLog.loggedAt])),
    [symptomLogs],
  );

  const activeTreatments = treatments.filter(
    (treatment) => treatment.status === "active",
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tratamientos</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Seguimiento de medicacion y tratamientos relacionados.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() =>
              setVisibleDraft((current) => (current === "log" ? null : "log"))
            }
          >
            <Plus aria-hidden="true" />
            Registrar toma
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleDraft((current) => (current === "treatment" ? null : "treatment"))
            }
          >
            <Stethoscope aria-hidden="true" />
            Añadir tratamiento
          </Button>
        </div>
      </section>

      {visibleDraft === "log" && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva toma</CardTitle>
            <CardDescription>
              Formulario visual preparado para futuro POST /treatment-logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreatmentDraftForm
              mode="log"
              mealLogs={mealLogs}
              symptomLogs={symptomLogs}
              treatments={treatments}
            />
          </CardContent>
        </Card>
      )}

      {visibleDraft === "treatment" && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo tratamiento</CardTitle>
            <CardDescription>
              Formulario visual preparado para futuro POST /treatments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreatmentDraftForm mode="treatment" />
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{activeTreatments.length}</CardTitle>
            <CardDescription>Tratamientos activos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{treatmentLogs.length}</CardTitle>
            <CardDescription>Tomas registradas</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {treatments.filter((treatment) => treatment.status === "completed").length}
            </CardTitle>
            <CardDescription>Finalizados</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tratamientos registrados</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Diario de seguimiento, no recomendador medico.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tomas recientes</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Registro cronologico para cruzar con comidas y sintomas.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {treatmentLogs.map((treatmentLog) => (
            <TreatmentLogCard
              key={treatmentLog.id}
              treatmentLog={treatmentLog}
              treatmentName={treatmentNameById.get(treatmentLog.treatmentId)}
              relatedMealDescription={
                treatmentLog.relatedMealLogId
                  ? mealDescriptionById.get(treatmentLog.relatedMealLogId)
                  : undefined
              }
              relatedSymptomDate={
                treatmentLog.relatedSymptomLogId
                  ? symptomDateById.get(treatmentLog.relatedSymptomLogId)
                  : undefined
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
