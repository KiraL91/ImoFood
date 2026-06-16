import { Pencil, Scale, Trash2, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { foodStatusMeta } from "@/lib/constants/status";
import type { Food } from "@/lib/types/food";
import { cn } from "@/lib/utils/cn";

type FoodCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  canRegisterMeal?: boolean;
  food: Food;
  isDeleting?: boolean;
  onDelete?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onRegisterMeal?: (food: Food) => void;
};

export function FoodCard({
  canDelete = false,
  canEdit = false,
  canRegisterMeal = false,
  food,
  isDeleting = false,
  onDelete,
  onEdit,
  onRegisterMeal,
}: FoodCardProps) {
  const status = foodStatusMeta[food.status];
  const showActions = canEdit || canDelete || canRegisterMeal;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{food.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{food.category}</p>
          </div>
          <Badge variant="outline" className={status.badgeClassName}>
            {status.label}
          </Badge>
        </div>
        {showActions && (
          <div className="mt-3 flex gap-2">
            {canRegisterMeal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRegisterMeal?.(food)}
              >
                <Utensils aria-hidden="true" />
                Registrar ingesta
              </Button>
            )}
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(food)}
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
                onClick={() => onDelete?.(food)}
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
        {food.notes && (
          <p className="text-sm leading-6 text-muted-foreground">{food.notes}</p>
        )}
        {food.suggestedServing && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <Scale className="size-4 text-muted-foreground" aria-hidden="true" />
              <span>Racion sugerida</span>
            </div>
            <p className="leading-6 text-muted-foreground">{food.suggestedServing}</p>
          </div>
        )}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tolerancia</span>
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
        <div className="flex flex-wrap gap-2">
          {food.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
