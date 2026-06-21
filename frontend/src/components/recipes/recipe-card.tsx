import {
  ChevronDown,
  Clock,
  ListChecks,
  ListOrdered,
  Pencil,
  Trash2,
  Utensils,
} from "lucide-react";
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
  const recipeSteps = recipe.steps ?? [];
  const visibleSteps = recipeSteps.slice(0, 2);
  const hiddenSteps = recipeSteps.slice(2);

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
        {recipeSteps.length > 0 && (
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
                <ListOrdered className="size-4" aria-hidden="true" />
                Pasos
              </p>
              <span className="text-xs text-muted-foreground">
                {recipeSteps.length} pasos
              </span>
            </div>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {visibleSteps.map((step, index) => (
                <li key={`${index}-${step}`}>{step}</li>
              ))}
            </ol>
            {hiddenSteps.length > 0 && (
              <details className="group mt-2">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-primary outline-none transition hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Ver {hiddenSteps.length} pasos mas
                  <ChevronDown
                    className="size-4 transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ol
                  start={3}
                  className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground"
                >
                  {hiddenSteps.map((step, index) => (
                    <li key={`${index + visibleSteps.length}-${step}`}>{step}</li>
                  ))}
                </ol>
              </details>
            )}
          </div>
        )}
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
