import { CalendarDays, Pencil, Pill, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  treatmentCategoryMeta,
  treatmentStatusMeta,
  treatmentTargetLabels,
} from "@/lib/constants/treatments";
import type { Treatment } from "@/lib/types/treatment";

type TreatmentCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  isDeleting?: boolean;
  onDelete?: (treatment: Treatment) => void;
  onEdit?: (treatment: Treatment) => void;
  treatment: Treatment;
};

export function TreatmentCard({
  canDelete = false,
  canEdit = false,
  isDeleting = false,
  onDelete,
  onEdit,
  treatment,
}: TreatmentCardProps) {
  const category = treatmentCategoryMeta[treatment.category];
  const status = treatmentStatusMeta[treatment.status];
  const showActions = canEdit || canDelete;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Pill className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle>{treatment.name}</CardTitle>
              <CardDescription>{category.label}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>
        {showActions && (
          <div className="mt-3 flex gap-2">
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(treatment)}
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
                onClick={() => onDelete?.(treatment)}
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
          <Badge variant="outline" className={category.className}>
            {category.label}
          </Badge>
        </div>

        {(treatment.startDate || treatment.endDate) && (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span>
              {treatment.startDate ?? "Sin inicio"} - {treatment.endDate ?? "sin fin"}
            </span>
          </div>
        )}

        {treatment.notes && (
          <p className="text-sm leading-6 text-muted-foreground">{treatment.notes}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {treatment.targets.map((target) => (
            <Badge key={target} variant="secondary">
              {treatmentTargetLabels[target]}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
