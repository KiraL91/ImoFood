import { Activity, CalendarClock, Pencil, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SymptomLog } from "@/lib/types/symptom-log";
import { formatDateTime } from "@/lib/utils/format-date";

type SymptomLogCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  isDeleting?: boolean;
  onDelete?: (symptomLog: SymptomLog) => void;
  onEdit?: (symptomLog: SymptomLog) => void;
  symptomLog: SymptomLog;
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

export function SymptomLogCard({
  canDelete = false,
  canEdit = false,
  isDeleting = false,
  onDelete,
  onEdit,
  symptomLog,
}: SymptomLogCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Activity className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle>Entrada de sintomas</CardTitle>
              <CardDescription className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden="true" />
                {formatDateTime(symptomLog.loggedAt)}
              </CardDescription>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex shrink-0 gap-1">
              {canEdit && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  title="Editar sintomas"
                  onClick={() => onEdit?.(symptomLog)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              )}
              {canDelete && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  title="Borrar sintomas"
                  onClick={() => onDelete?.(symptomLog)}
                  disabled={isDeleting}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {symptomLog.mealLog && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Utensils className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Ingesta: {symptomLog.mealLog.description}</span>
            </div>
            <p className="mt-1 pl-5 text-xs">
              {formatDateTime(symptomLog.mealLog.consumedAt)}
            </p>
          </div>
        )}

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

        {symptomLog.notes ? (
          <p className="text-sm leading-6 text-muted-foreground">{symptomLog.notes}</p>
        ) : (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Sin notas adicionales.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
