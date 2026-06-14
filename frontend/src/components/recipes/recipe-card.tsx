import { Clock, ListChecks, Pencil, Trash2, Utensils } from "lucide-react";
import { RecipeRating } from "@/components/recipes/recipe-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recipe } from "@/lib/types/recipe";

type RecipeCardProps = {
  canDelete?: boolean;
  canEdit?: boolean;
  canLogMeal?: boolean;
  isDeleting?: boolean;
  onDelete?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onLogMeal?: (recipe: Recipe) => void;
  onRatingChange?: (
    recipe: Recipe,
    rating: NonNullable<Recipe["rating"]>,
  ) => Promise<void> | void;
  recipe: Recipe;
};

export function RecipeCard({
  canDelete = false,
  canEdit = false,
  canLogMeal = false,
  isDeleting = false,
  onDelete,
  onEdit,
  onLogMeal,
  onRatingChange,
  recipe,
}: RecipeCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{recipe.name}</CardTitle>
          {(canEdit || canDelete) && (
            <div className="flex shrink-0 gap-1">
              {canEdit && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  title="Editar receta"
                  onClick={() => onEdit?.(recipe)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              )}
              {canDelete && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  title="Borrar receta"
                  onClick={() => onDelete?.(recipe)}
                  disabled={isDeleting}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
        {recipe.description && <CardDescription>{recipe.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {canLogMeal && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onLogMeal?.(recipe)}
          >
            <Utensils aria-hidden="true" />
            Registrar como comida
          </Button>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {recipe.prepTimeMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-4" aria-hidden="true" />
            {recipe.ingredients.length} ingredientes
          </span>
        </div>
        <RecipeRating
          initialRating={recipe.rating}
          isDisabled={!canEdit}
          onChange={(rating) => onRatingChange?.(recipe, rating)}
        />
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Ingredientes
          </p>
          <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
            {recipe.ingredients.slice(0, 4).map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
