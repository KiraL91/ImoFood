import { Eye, Pencil, Trash2, Utensils } from "lucide-react";
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
  editLabel?: string;
  food: Food;
  isDeleting?: boolean;
  onDelete?: (food: Food) => void;
  onEdit?: (food: Food) => void;
  onRegisterMeal?: (food: Food) => void;
  onViewDetails?: (food: Food) => void;
};

export function FoodCard({
  canDelete = false,
  canEdit = false,
  canRegisterMeal = false,
  editLabel = "Editar",
  food,
  isDeleting = false,
  onDelete,
  onEdit,
  onRegisterMeal,
  onViewDetails,
}: FoodCardProps) {
  const status = foodStatusMeta[food.status];
  const visibleTags = food.tags.slice(0, 3);
  const hiddenTagsCount = food.tags.length - visibleTags.length;
  const showActions = canEdit || canDelete || canRegisterMeal || onViewDetails;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
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
          <div className="flex flex-wrap gap-2">
            {onViewDetails && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(food)}
              >
                <Eye aria-hidden="true" />
                Detalle
              </Button>
            )}
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
                title={editLabel}
                onClick={() => onEdit?.(food)}
              >
                <Pencil aria-hidden="true" />
                {editLabel}
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
      <CardContent className="space-y-3">
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
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {hiddenTagsCount > 0 && <Badge variant="outline">+{hiddenTagsCount}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
