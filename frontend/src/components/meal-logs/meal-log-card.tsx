import {
  Activity,
  BookOpen,
  CalendarClock,
  Pencil,
  Plus,
  Trash2,
  Utensils,
} from "lucide-react";
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

type MealLogCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  canRegisterSymptoms?: boolean;
  isDeleting?: boolean;
  mealLog: MealLog;
  onDelete?: (mealLog: MealLog) => void;
  onEdit?: (mealLog: MealLog) => void;
  onRegisterSymptoms?: (mealLog: MealLog) => void;
  symptomLogs?: SymptomLog[];
};

const symptomLabels: Record<
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

export function MealLogCard({
  canDelete = false,
  canEdit = false,
  canRegisterSymptoms = false,
  isDeleting = false,
  mealLog,
  onDelete,
  onEdit,
  onRegisterSymptoms,
  symptomLogs = [],
}: MealLogCardProps) {
  const latestSymptomLog = symptomLogs[0];
  const highestSymptomSignal = symptomLogs.reduce<
    | {
        label: string;
        score: number;
      }
    | undefined
  >((highestSignal, symptomLog) => {
    const symptomSignal = Object.entries(symptomLabels).reduce(
      (currentHighest, [key, label]) => {
        const score = symptomLog[key as keyof typeof symptomLabels];

        return score > currentHighest.score ? { label, score } : currentHighest;
      },
      { label: "Hinchazon", score: symptomLog.bloating },
    );

    return !highestSignal || symptomSignal.score > highestSignal.score
      ? symptomSignal
      : highestSignal;
  }, undefined);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Utensils className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle>{mealLog.description}</CardTitle>
              <CardDescription className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden="true" />
                {formatDateTime(mealLog.consumedAt)}
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
                  title="Editar comida"
                  onClick={() => onEdit?.(mealLog)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              )}
              {canDelete && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  title="Borrar comida"
                  onClick={() => onDelete?.(mealLog)}
                  disabled={isDeleting}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mealLog.recipe && (
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <BookOpen className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Receta: {mealLog.recipe.name}</span>
          </div>
        )}

        {symptomLogs.length > 0 && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Activity className="size-4 shrink-0" aria-hidden="true" />
              <span>Sintomas asociados: {symptomLogs.length}</span>
            </div>
            <div className="mt-2 grid gap-1 pl-5 text-xs">
              {highestSymptomSignal && (
                <span>
                  Maximo: {highestSymptomSignal.label} {highestSymptomSignal.score}
                  /10
                </span>
              )}
              {latestSymptomLog && (
                <span>Ultimo: {formatDateTime(latestSymptomLog.loggedAt)}</span>
              )}
            </div>
          </div>
        )}

        {mealLog.notes ? (
          <p className="text-sm leading-6 text-muted-foreground">{mealLog.notes}</p>
        ) : (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Sin notas adicionales.
          </div>
        )}

        {canRegisterSymptoms && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onRegisterSymptoms?.(mealLog)}
          >
            <Plus aria-hidden="true" />
            Registrar sintomas
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
