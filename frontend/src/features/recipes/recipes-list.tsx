import { RecipeCard } from "@/components/recipes/recipe-card";
import type { Recipe } from "@/lib/types/recipe";

type RecipesListProps = {
  recipes: Recipe[];
};

export function RecipesList({ recipes }: RecipesListProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </section>
  );
}
