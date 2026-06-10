"use client";

import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Recipe } from "@/lib/types/recipe";
import { cn } from "@/lib/utils/cn";

type RecipesExplorerProps = {
  recipes: Recipe[];
};

type MinRatingFilter = 0 | 3 | 4 | 5;

const ratingFilters: Array<{ label: string; value: MinRatingFilter }> = [
  { label: "Todas", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5", value: 5 },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function RecipesExplorer({ recipes }: RecipesExplorerProps) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<MinRatingFilter>(0);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);

  const frequentIngredients = useMemo(() => {
    const counts = new Map<string, number>();

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([ingredient]) => ingredient);
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = normalize(query);
    const normalizedIngredient = selectedIngredient
      ? normalize(selectedIngredient)
      : null;

    return recipes.filter((recipe) => {
      const searchableText = [
        recipe.name,
        recipe.description ?? "",
        recipe.ingredients.join(" "),
        recipe.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
      const matchesRating = minRating === 0 || (recipe.rating ?? 0) >= minRating;
      const matchesIngredient =
        normalizedIngredient === null ||
        recipe.ingredients.some((ingredient) =>
          normalize(ingredient).includes(normalizedIngredient),
        );

      return matchesQuery && matchesRating && matchesIngredient;
    });
  }, [minRating, query, recipes, selectedIngredient]);

  const hasActiveFilters =
    query.trim().length > 0 || minRating !== 0 || selectedIngredient !== null;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
          <div className="space-y-4">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar receta, ingrediente o etiqueta"
                className="pl-9"
                aria-label="Buscar recetas"
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Ingredientes frecuentes
              </p>
              <div className="flex flex-wrap gap-2">
                {frequentIngredients.map((ingredient) => {
                  const isSelected = selectedIngredient === ingredient;

                  return (
                    <Button
                      key={ingredient}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() =>
                        setSelectedIngredient((current) =>
                          current === ingredient ? null : ingredient,
                        )
                      }
                    >
                      {ingredient}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Estrellas minimas
              </p>
              <div className="flex flex-wrap gap-2">
                {ratingFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={minRating === filter.value ? "default" : "outline"}
                    onClick={() => setMinRating(filter.value)}
                  >
                    {filter.value > 0 && <Star aria-hidden="true" />}
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{filteredRecipes.length} recetas</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!hasActiveFilters}
                onClick={() => {
                  setQuery("");
                  setMinRating(0);
                  setSelectedIngredient(null);
                }}
                className={cn(!hasActiveFilters && "opacity-40")}
              >
                <X aria-hidden="true" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>

      {filteredRecipes.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay recetas que coincidan con los filtros actuales.
        </div>
      )}
    </div>
  );
}
