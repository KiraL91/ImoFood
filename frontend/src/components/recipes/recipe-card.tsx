import { Clock, ListChecks } from "lucide-react";
import { RecipeRating } from "@/components/recipes/recipe-rating";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Recipe } from "@/lib/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{recipe.name}</CardTitle>
        {recipe.description && <CardDescription>{recipe.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
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
        <RecipeRating initialRating={recipe.rating} />
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
