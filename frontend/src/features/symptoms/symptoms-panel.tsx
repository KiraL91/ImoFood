"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarClock, ClipboardList } from "lucide-react";
import { SymptomLogForm } from "@/components/symptoms/symptom-log-form";
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
import { formatDateTime } from "@/lib/utils/format-date";

const symptomSignals = ["Hinchazon", "Dolor", "Gases", "Transito", "Energia", "Sueno"];

type SymptomsPanelProps = {
  mealLogs: MealLog[];
  symptomLogs: SymptomLog[];
};

const signalLabels: Record<
  keyof Pick<SymptomLog, "bloating" | "pain" | "gas" | "transit" | "energy" | "sleep">,
  string
> = {
  bloating: "Hinchazon",
  pain: "Dolor",
  gas: "Gases",
  transit: "Transito",
  energy: "Energia",
  sleep: "Sueno",
};

export function SymptomsPanel({ mealLogs, symptomLogs }: SymptomsPanelProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [localSymptomLogs, setLocalSymptomLogs] = useState(symptomLogs);

  const mealDescriptionById = useMemo(
    () => new Map(mealLogs.map((mealLog) => [mealLog.id, mealLog.description])),
    [mealLogs],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Diario de sintomas</CardTitle>
            <CardDescription>
              Registro local preparado para correlacionar comidas y evolucion diaria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {symptomSignals.map((signal) => (
                <div key={signal} className="rounded-lg border bg-muted p-4">
                  <Activity className="mb-3 size-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-medium">{signal}</p>
                </div>
              ))}
            </div>
            <Button type="button" onClick={() => setIsFormVisible((value) => !value)}>
              <ClipboardList aria-hidden="true" />
              Registrar entrada
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proxima fase</CardTitle>
            <CardDescription>
              Correlacion entre alimentos, recetas y sintomas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
              <CalendarClock className="mb-3 size-5" aria-hidden="true" />
              Backend pendiente para historial, metricas y filtros por fecha.
            </div>
          </CardContent>
        </Card>
      </div>

      {isFormVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva entrada de sintomas</CardTitle>
            <CardDescription>
              Se guarda solo en estado local hasta conectar POST /symptom-logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SymptomLogForm
              mealLogs={mealLogs}
              onSubmit={(symptomLog) =>
                setLocalSymptomLogs((current) => [symptomLog, ...current])
              }
            />
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {localSymptomLogs.map((symptomLog) => (
          <Card key={symptomLog.id}>
            <CardHeader>
              <CardTitle>{formatDateTime(symptomLog.loggedAt)}</CardTitle>
              {symptomLog.relatedMealLogId && (
                <CardDescription>
                  {mealDescriptionById.get(symptomLog.relatedMealLogId)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(signalLabels).map(([key, label]) => (
                  <div key={key} className="rounded-md border bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">
                      {symptomLog[key as keyof typeof signalLabels]}/10
                    </p>
                  </div>
                ))}
              </div>
              {symptomLog.notes && (
                <p className="text-sm leading-6 text-muted-foreground">
                  {symptomLog.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
