import { CalendarClock, ClipboardList, Pencil, Trash2, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { treatmentTimingMeta } from "@/lib/constants/treatments";
import type { TreatmentLog } from "@/lib/types/treatment";
import { formatDateTime } from "@/lib/utils/format-date";

type TreatmentLogCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  isDeleting?: boolean;
  onDelete?: (treatmentLog: TreatmentLog) => void;
  onEdit?: (treatmentLog: TreatmentLog) => void;
  treatmentLog: TreatmentLog;
  treatmentName?: string;
  relatedMealDescription?: string;
  relatedSymptomDate?: string;
};

export function TreatmentLogCard({
  canDelete = false,
  canEdit = false,
  isDeleting = false,
  onDelete,
  onEdit,
  treatmentLog,
  treatmentName,
  relatedMealDescription,
  relatedSymptomDate,
}: TreatmentLogCardProps) {
  const showActions = canEdit || canDelete;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <ClipboardList className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle>{treatmentName ?? "Tratamiento"}</CardTitle>
              <CardDescription className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden="true" />
                {formatDateTime(treatmentLog.takenAt)}
              </CardDescription>
            </div>
          </div>
        </div>
        {showActions && (
          <div className="mt-3 flex gap-2">
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(treatmentLog)}
              >
                <Pencil aria-hidden="true" />
                Editar
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(treatmentLog)}
                disabled={isDeleting}
              >
                <Trash2 aria-hidden="true" />
                {isDeleting ? "Borrando..." : "Borrar"}
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {treatmentLog.dose && <Badge variant="secondary">{treatmentLog.dose}</Badge>}
          {treatmentLog.timing && (
            <Badge variant="outline">{treatmentTimingMeta[treatmentLog.timing]}</Badge>
          )}
        </div>

        {relatedMealDescription && (
          <div className="rounded-md border bg-muted px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Utensils className="size-4 text-primary" aria-hidden="true" />
              {relatedMealDescription}
            </span>
          </div>
        )}

        {relatedSymptomDate && (
          <p className="text-sm text-muted-foreground">
            Sintomas relacionados: {formatDateTime(relatedSymptomDate)}
          </p>
        )}

        {treatmentLog.notes && (
          <p className="text-sm leading-6 text-muted-foreground">{treatmentLog.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
