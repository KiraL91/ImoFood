import { CalendarClock, Pencil, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealLog } from "@/lib/types/meal-log";
import { formatDateTime } from "@/lib/utils/format-date";

type MealLogCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  isDeleting?: boolean;
  mealLog: MealLog;
  onDelete?: (mealLog: MealLog) => void;
  onEdit?: (mealLog: MealLog) => void;
};

export function MealLogCard({
  canDelete = false,
  canEdit = false,
  isDeleting = false,
  mealLog,
  onDelete,
  onEdit,
}: MealLogCardProps) {
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
      <CardContent>
        {mealLog.notes ? (
          <p className="text-sm leading-6 text-muted-foreground">{mealLog.notes}</p>
        ) : (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Sin notas adicionales.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
