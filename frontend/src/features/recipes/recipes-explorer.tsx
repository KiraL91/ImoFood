"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Server, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeFormDialog } from "@/components/recipes/recipe-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateRecipeInput } from "@/features/recipes/recipes-api";
import {
  useCreateRecipe,
  useDeleteRecipe,
  useRecipes,
  useUpdateRecipe,
} from "@/features/recipes/recipes-queries";
import { env } from "@/lib/env";
import type { Recipe } from "@/lib/types/recipe";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/auth-provider";

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

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function RecipesExplorer() {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<MinRatingFilter>(0);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>();
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const router = useRouter();
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateRecipe = hasPermission("recipes:create");
  const canUpdateRecipe = hasPermission("recipes:update");
  const canDeleteRecipe = hasPermission("recipes:delete");
  const canCreateMealLog = hasPermission("meal-logs:create");
  const recipesQuery = useRecipes();
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  const recipes = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (recipesQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, recipesQuery.data],
  );
  const isSubmitting = createRecipeMutation.isPending || updateRecipeMutation.isPending;
  const isFormDisabled =
    !hasBackendConfigured ||
    !isAuthenticated ||
    (editingRecipe ? !canUpdateRecipe : !canCreateRecipe);
  const canOpenCreateDialog = hasBackendConfigured && isAuthenticated && canCreateRecipe;
  const canLogRecipeAsMeal = hasBackendConfigured && isAuthenticated && canCreateMealLog;
  const disabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar recetas contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para usar el CRUD real de recetas."
      : editingRecipe
        ? "Tu rol no permite editar recetas."
        : "Tu rol no permite crear recetas.";

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

  async function handleRecipeSubmit(input: CreateRecipeInput) {
    setMutationError(null);

    try {
      if (editingRecipe) {
        await updateRecipeMutation.mutateAsync({
          id: editingRecipe.id,
          input,
        });
        setEditingRecipe(undefined);
        setIsRecipeDialogOpen(false);
        return;
      }

      await createRecipeMutation.mutateAsync(input);
      setIsRecipeDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleDeleteRecipe(recipe: Recipe) {
    const confirmed = window.confirm(`Borrar "${recipe.name}" de tus recetas?`);

    if (!confirmed) {
      return;
    }

    setMutationError(null);

    try {
      await deleteRecipeMutation.mutateAsync(recipe.id);

      if (editingRecipe?.id === recipe.id) {
        setEditingRecipe(undefined);
      }
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleRatingChange(
    recipe: Recipe,
    rating: NonNullable<Recipe["rating"]>,
  ) {
    if (!canUpdateRecipe) {
      return;
    }

    setMutationError(null);

    try {
      await updateRecipeMutation.mutateAsync({
        id: recipe.id,
        input: {
          rating,
        },
      });
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  function handleOpenCreateRecipeDialog() {
    setMutationError(null);
    setEditingRecipe(undefined);
    setIsRecipeDialogOpen(true);
  }

  function handleOpenEditRecipeDialog(recipe: Recipe) {
    setMutationError(null);
    setEditingRecipe(recipe);
    setIsRecipeDialogOpen(true);
  }

  function handleRecipeDialogOpenChange(open: boolean) {
    setIsRecipeDialogOpen(open);

    if (!open) {
      setEditingRecipe(undefined);
      setMutationError(null);
    }
  }

  function handleLogRecipeMeal(recipe: Recipe) {
    router.push(`/meal-logs?recipeId=${encodeURIComponent(recipe.id)}`);
  }

  return (
    <div className="space-y-5">
      <RecipeFormDialog
        disabledReason={disabledReason}
        errorMessage={mutationError}
        initialRecipe={editingRecipe}
        isDisabled={isFormDisabled}
        isOpen={isRecipeDialogOpen}
        isSubmitting={isSubmitting}
        mode={editingRecipe ? "edit" : "create"}
        onCancel={() => {
          setEditingRecipe(undefined);
          setMutationError(null);
        }}
        onOpenChange={handleRecipeDialogOpenChange}
        onSubmit={handleRecipeSubmit}
      />

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando recetas mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      {mutationError && !isRecipeDialogOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {recipesQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(recipesQuery.error)}
        </div>
      )}

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
            <Button
              type="button"
              className="w-full"
              disabled={!canOpenCreateDialog}
              title={canOpenCreateDialog ? "Anadir receta" : disabledReason}
              onClick={handleOpenCreateRecipeDialog}
            >
              <Plus aria-hidden="true" />
              Anadir receta
            </Button>

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

      {recipesQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando recetas...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            canDelete={hasBackendConfigured && isAuthenticated && canDeleteRecipe}
            canEdit={hasBackendConfigured && isAuthenticated && canUpdateRecipe}
            canLogMeal={canLogRecipeAsMeal}
            isDeleting={
              deleteRecipeMutation.isPending &&
              deleteRecipeMutation.variables === recipe.id
            }
            recipe={recipe}
            onDelete={handleDeleteRecipe}
            onEdit={handleOpenEditRecipeDialog}
            onLogMeal={handleLogRecipeMeal}
            onRatingChange={handleRatingChange}
          />
        ))}
      </section>

      {!recipesQuery.isLoading && filteredRecipes.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay recetas que coincidan con los filtros actuales.
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-24 right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateDialog}
        title={canOpenCreateDialog ? "Anadir receta" : disabledReason}
        aria-label="Anadir receta"
        onClick={handleOpenCreateRecipeDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
