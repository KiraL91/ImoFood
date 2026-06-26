import Link from "next/link";
import { Activity, Scale, StickyNote, Tags, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { foodStatusMeta } from "@/lib/constants/status";
import type { Food } from "@/lib/types/food";
import { cn } from "@/lib/utils/cn";

type FoodDetailDialogProps = {
  canRegisterMeal?: boolean;
  food?: Food;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterMeal?: (food: Food) => void;
};

function getRelatedSymptomsHref(food: Food) {
  const searchParams = new URLSearchParams({
    foodId: food.id,
    foodName: food.name,
  });

  return `/symptoms?${searchParams.toString()}`;
}

export function FoodDetailDialog({
  canRegisterMeal = false,
  food,
  isOpen,
  onOpenChange,
  onRegisterMeal,
}: FoodDetailDialogProps) {
  if (!food) {
    return null;
  }

  const status = foodStatusMeta[food.status];

  return (
    <Dialog
      className="max-w-2xl"
      description="Informacion personal del alimento y accesos de seguimiento."
      open={isOpen}
      title={food.name}
      onOpenChange={onOpenChange}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={status.badgeClassName}>
            {status.label}
          </Badge>
          {food.customPreferenceFields.status && (
            <Badge variant="secondary">Estado personalizado</Badge>
          )}
          <Badge variant="secondary">{food.category}</Badge>
          <Badge variant="outline">Tolerancia {food.tolerance}/5</Badge>
          {food.hasCustomPreference && (
            <Badge variant="default">Preferencia personalizada</Badge>
          )}
        </div>

        {food.hasCustomPreference && (
          <section className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            <p className="font-medium">Valores personalizados</p>
            <p className="mt-1 leading-6 text-muted-foreground">
              Este alimento no sigue exactamente los valores base del catalogo para tu
              usuario.
            </p>
          </section>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="inline-flex flex-wrap items-center gap-2">
              Tolerancia personal
              {food.customPreferenceFields.tolerance && (
                <Badge variant="secondary">Personalizada</Badge>
              )}
            </span>
            <span>{food.tolerance}/5</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-2 rounded-sm bg-muted",
                  index < food.tolerance && status.dotClassName,
                )}
              />
            ))}
          </div>
        </div>

        <section className="rounded-md border bg-muted/30 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Scale className="size-4 text-muted-foreground" aria-hidden="true" />
            <h3>Racion sugerida</h3>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {food.suggestedServing ??
              "Todavia no hay una racion sugerida para este alimento."}
          </p>
        </section>

        <section className="rounded-md border bg-background px-4 py-3">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <StickyNote className="size-4 text-muted-foreground" aria-hidden="true" />
            <h3>Notas personales</h3>
            {food.customPreferenceFields.notes && (
              <Badge variant="secondary">Personalizadas</Badge>
            )}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {food.notes ?? "Sin notas personales registradas."}
          </p>
        </section>

        {food.tags.length > 0 && (
          <section className="rounded-md border bg-background px-4 py-3">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <Tags className="size-4 text-muted-foreground" aria-hidden="true" />
              <h3>Etiquetas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {food.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link href={getRelatedSymptomsHref(food)}>
              <Activity aria-hidden="true" />
              Ver sintomas relacionados
            </Link>
          </Button>
          <Button
            type="button"
            disabled={!canRegisterMeal}
            title={
              canRegisterMeal
                ? "Registrar ingesta"
                : "No tienes permisos para registrar ingestas."
            }
            onClick={() => onRegisterMeal?.(food)}
          >
            <Utensils aria-hidden="true" />
            Registrar ingesta
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
