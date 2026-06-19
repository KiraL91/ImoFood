"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Brain,
  Check,
  CheckCircle2,
  ListChecks,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { MealIdeaCard } from "@/components/meal-ideas/meal-idea-card";
import { RecipeFormDialog } from "@/components/recipes/recipe-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFoods } from "@/features/foods/foods-queries";
import {
  useAiSuggestionsConfig,
  useGenerateAiMealIdeas,
} from "@/features/meal-ideas/ai-meal-ideas-queries";
import type {
  AiMealIdeaSuggestion,
  GenerateAiMealIdeasInput,
} from "@/features/meal-ideas/ai-meal-ideas-api";
import { buildMealIdeas } from "@/features/meal-ideas/meal-ideas-generator";
import type { CreateRecipeInput } from "@/features/recipes/recipes-api";
import { useCreateRecipe, useRecipes } from "@/features/recipes/recipes-queries";
import { env } from "@/lib/env";
import type { Food } from "@/lib/types/food";
import { useAuth } from "@/providers/auth-provider";

type SuggestionMode = "basic" | "ai";
type AiMealTypePreference = "auto" | NonNullable<GenerateAiMealIdeasInput["mealType"]>;
type AiGoalPreference = NonNullable<GenerateAiMealIdeasInput["goal"]>;

const mealTypeOptions: Array<{
  label: string;
  value: AiMealTypePreference;
}> = [
  { label: "Automatico", value: "auto" },
  { label: "Desayuno", value: "breakfast" },
  { label: "Comida", value: "lunch" },
  { label: "Cena", value: "dinner" },
  { label: "Snack", value: "snack" },
];

const goalOptions: Array<{
  label: string;
  value: AiGoalPreference;
}> = [
  { label: "Equilibrado", value: "balanced" },
  { label: "Rapido", value: "quick" },
  { label: "Suave", value: "gentle" },
  { label: "Saciante", value: "filling" },
  { label: "Bajo riesgo", value: "low-risk" },
  { label: "Aprovechar alimentos", value: "use-leftovers" },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se han podido calcular las sugerencias.";
}

function getSafeFoods(foods: Food[]) {
  return foods.filter((food) => food.status === "allowed" && food.tolerance >= 4);
}

function getReasonableFoods(foods: Food[]) {
  return foods.filter(
    (food) =>
      food.status !== "avoid" &&
      food.status !== "caution" &&
      (food.status === "allowed" || food.tolerance >= 3),
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getAiSuggestionKey(suggestion: AiMealIdeaSuggestion) {
  return `${suggestion.title}-${suggestion.items.join("|")}`;
}

function getUniqueItems(items: string[]) {
  return Array.from(
    new Set(items.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
}

function createVariationSeed() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toRecipeDraft(suggestion: AiMealIdeaSuggestion): CreateRecipeInput {
  return {
    description: suggestion.reason,
    ingredients:
      suggestion.foodNames.length > 0
        ? getUniqueItems(suggestion.foodNames)
        : getUniqueItems(suggestion.items),
    name: suggestion.title,
    prepTimeMinutes: 15,
    steps: [
      "Revisar tolerancia personal antes de repetir.",
      "Preparar los alimentos indicados y ajustar raciones segun tolerancia.",
    ],
    tags: getUniqueItems([...suggestion.tags, "ia"]),
  };
}

export function MealIdeasList() {
  const [mode, setMode] = useState<SuggestionMode>("basic");
  const [mealTypePreference, setMealTypePreference] =
    useState<AiMealTypePreference>("auto");
  const [goalPreference, setGoalPreference] = useState<AiGoalPreference>("balanced");
  const [aiNotes, setAiNotes] = useState("");
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [foodSearch, setFoodSearch] = useState("");
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("all");
  const [showOnlySelectedFoods, setShowOnlySelectedFoods] = useState(false);
  const [selectedAiSuggestion, setSelectedAiSuggestion] =
    useState<AiMealIdeaSuggestion | null>(null);
  const [savedAiSuggestionKeys, setSavedAiSuggestionKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [saveRecipeError, setSaveRecipeError] = useState<string | null>(null);
  const foodsQuery = useFoods();
  const recipesQuery = useRecipes();
  const aiConfigQuery = useAiSuggestionsConfig();
  const generateAiMealIdeas = useGenerateAiMealIdeas();
  const createRecipe = useCreateRecipe();
  const { hasPermission, isAuthenticated } = useAuth();
  const isLoading = foodsQuery.isLoading || recipesQuery.isLoading;
  const errors = [foodsQuery.error, recipesQuery.error].filter(Boolean);
  const foods = useMemo(() => foodsQuery.data ?? [], [foodsQuery.data]);
  const recipes = useMemo(() => recipesQuery.data ?? [], [recipesQuery.data]);
  const mealIdeas = buildMealIdeas({
    foods,
    recipes,
  });
  const safeFoods = useMemo(() => getSafeFoods(foods), [foods]);
  const reasonableFoods = useMemo(() => getReasonableFoods(foods), [foods]);
  const reasonableFoodIds = useMemo(
    () => reasonableFoods.map((food) => food.id),
    [reasonableFoods],
  );
  const selectedReasonableFoods = useMemo(
    () => reasonableFoods.filter((food) => selectedFoodIds.has(food.id)),
    [reasonableFoods, selectedFoodIds],
  );
  const foodCategories = useMemo(
    () =>
      Array.from(new Set(reasonableFoods.map((food) => food.category)))
        .filter(Boolean)
        .sort((leftCategory, rightCategory) =>
          leftCategory.localeCompare(rightCategory, "es"),
        ),
    [reasonableFoods],
  );
  const filteredReasonableFoods = useMemo(() => {
    const normalizedSearch = normalizeSearch(foodSearch);

    return reasonableFoods
      .filter((food) =>
        [
          foodCategoryFilter === "all" || food.category === foodCategoryFilter,
          !showOnlySelectedFoods || selectedFoodIds.has(food.id),
          !normalizedSearch ||
            normalizeSearch(
              [food.name, food.category, food.tags.join(" ")].join(" "),
            ).includes(normalizedSearch),
        ].every(Boolean),
      )
      .sort((leftFood, rightFood) => leftFood.name.localeCompare(rightFood.name, "es"));
  }, [
    foodCategoryFilter,
    foodSearch,
    reasonableFoods,
    selectedFoodIds,
    showOnlySelectedFoods,
  ]);
  const filteredReasonableFoodIds = useMemo(
    () => filteredReasonableFoods.map((food) => food.id),
    [filteredReasonableFoods],
  );
  const selectedFilteredFoodIdsCount = filteredReasonableFoodIds.filter((foodId) =>
    selectedFoodIds.has(foodId),
  ).length;
  const hasFoodSelectionFilters = Boolean(
    foodSearch || foodCategoryFilter !== "all" || showOnlySelectedFoods,
  );
  const goodRecipes = recipes.filter((recipe) => recipe.rating && recipe.rating >= 4);
  const isAiMode = mode === "ai";
  const hasApiBaseUrl = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const aiConfig = aiConfigQuery.data;
  const isAiReady = aiConfig?.status === "ready";
  const canGenerateWithAi =
    hasApiBaseUrl &&
    isAiReady &&
    selectedFoodIds.size > 0 &&
    !generateAiMealIdeas.isPending;
  const canCreateRecipeFromAi =
    hasApiBaseUrl && isAuthenticated && hasPermission("recipes:create");
  const saveRecipeDisabledReason = !hasApiBaseUrl
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar recetas."
    : !isAuthenticated
      ? "Inicia sesion para guardar recetas."
      : "Tu rol no permite crear recetas.";
  const selectedRecipeDraft = selectedAiSuggestion
    ? toRecipeDraft(selectedAiSuggestion)
    : undefined;
  const aiMealIdeas =
    generateAiMealIdeas.data?.suggestions.map((suggestion, index) => {
      const key = getAiSuggestionKey(suggestion);

      return {
        key,
        mealIdea: {
          id: `ai-${index}-${suggestion.title}`,
          items: suggestion.items,
          reason: suggestion.reason,
          tags: Array.from(new Set([...suggestion.tags, "ia"])),
          title: suggestion.title,
        },
        suggestion,
      };
    }) ?? [];

  const aiStatusText = !hasApiBaseUrl
    ? "Configura NEXT_PUBLIC_API_BASE_URL para usar el backend."
    : aiConfigQuery.isLoading
      ? "Comprobando configuracion de IA..."
      : aiConfigQuery.error
        ? getErrorMessage(aiConfigQuery.error)
        : aiConfig?.status === "ready"
          ? `Conectado a ${aiConfig.provider} / ${aiConfig.model}.`
          : "El backend esta conectado, pero la IA no esta activada.";

  useEffect(() => {
    setSelectedFoodIds((current) => {
      const availableFoodIds = new Set(reasonableFoodIds);
      const keptFoodIds = [...current].filter((foodId) => availableFoodIds.has(foodId));

      if (keptFoodIds.length > 0 || reasonableFoodIds.length === 0) {
        return new Set(keptFoodIds);
      }

      return new Set(reasonableFoodIds);
    });
  }, [reasonableFoodIds]);

  function buildAiMealIdeasInput(): GenerateAiMealIdeasInput {
    return {
      foodIds: [...selectedFoodIds],
      goal: goalPreference,
      limit: 3,
      mealType: mealTypePreference === "auto" ? undefined : mealTypePreference,
      notes: aiNotes.trim() || undefined,
      variationSeed: createVariationSeed(),
    };
  }

  function handleGenerateAiIdeas() {
    generateAiMealIdeas.mutate(buildAiMealIdeasInput());
  }

  function handleSelectAllFoods() {
    setSelectedFoodIds(new Set(reasonableFoodIds));
  }

  function handleClearFoodSelection() {
    setSelectedFoodIds(new Set());
  }

  function handleSelectVisibleFoods() {
    setSelectedFoodIds((current) => {
      const nextFoodIds = new Set(current);

      filteredReasonableFoodIds.forEach((foodId) => nextFoodIds.add(foodId));

      return nextFoodIds;
    });
  }

  function handleClearVisibleFoodSelection() {
    setSelectedFoodIds((current) => {
      const nextFoodIds = new Set(current);

      filteredReasonableFoodIds.forEach((foodId) => nextFoodIds.delete(foodId));

      return nextFoodIds;
    });
  }

  function handleClearFoodSelectionFilters() {
    setFoodSearch("");
    setFoodCategoryFilter("all");
    setShowOnlySelectedFoods(false);
  }

  function handleToggleFood(foodId: string) {
    setSelectedFoodIds((current) => {
      const nextFoodIds = new Set(current);

      if (nextFoodIds.has(foodId)) {
        nextFoodIds.delete(foodId);
      } else {
        nextFoodIds.add(foodId);
      }

      return nextFoodIds;
    });
  }

  function handleOpenSaveRecipeDialog(suggestion: AiMealIdeaSuggestion) {
    setSaveRecipeError(null);
    setSelectedAiSuggestion(suggestion);
  }

  function handleSaveRecipeDialogOpenChange(open: boolean) {
    if (!open) {
      setSelectedAiSuggestion(null);
      setSaveRecipeError(null);
    }
  }

  async function handleSaveRecipe(input: CreateRecipeInput) {
    if (!selectedAiSuggestion) {
      return;
    }

    setSaveRecipeError(null);

    try {
      await createRecipe.mutateAsync(input);
      const savedKey = getAiSuggestionKey(selectedAiSuggestion);
      setSavedAiSuggestionKeys((current) => new Set(current).add(savedKey));
      setSelectedAiSuggestion(null);
    } catch (error) {
      setSaveRecipeError(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-5">
      <RecipeFormDialog
        disabledReason={saveRecipeDisabledReason}
        errorMessage={saveRecipeError}
        initialInput={selectedRecipeDraft}
        isDisabled={!canCreateRecipeFromAi}
        isOpen={Boolean(selectedAiSuggestion)}
        isSubmitting={createRecipe.isPending}
        onOpenChange={handleSaveRecipeDialogOpenChange}
        onSubmit={handleSaveRecipe}
      />

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <h3 className="text-base font-semibold">Modo de sugerencia</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              El modo basico usa reglas locales. El modo IA consulta el backend y valida
              las respuestas antes de mostrarlas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-1">
            <Button
              type="button"
              variant={mode === "basic" ? "default" : "ghost"}
              onClick={() => setMode("basic")}
            >
              <ListChecks aria-hidden="true" />
              Sin IA
            </Button>
            <Button
              type="button"
              variant={mode === "ai" ? "default" : "ghost"}
              onClick={() => setMode("ai")}
            >
              <Brain aria-hidden="true" />
              IA avanzado
            </Button>
          </div>
        </div>
      </section>

      {!env.NEXT_PUBLIC_API_BASE_URL && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando sugerencias generadas desde mocks. Configura
            NEXT_PUBLIC_API_BASE_URL para usar alimentos y recetas reales.
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(errors[0])}
        </div>
      )}

      {isAiMode && !isLoading && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Generacion avanzada con IA</CardTitle>
                <CardDescription>{aiStatusText}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Alimentos seguros</p>
                <p className="text-xl font-semibold">{safeFoods.length}</p>
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Alimentos razonables</p>
                <p className="text-xl font-semibold">{reasonableFoods.length}</p>
              </div>
              <div className="rounded-md border bg-background px-3 py-2">
                <p className="text-xs text-muted-foreground">Recetas bien valoradas</p>
                <p className="text-xl font-semibold">{goodRecipes.length}</p>
              </div>
            </div>

            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
              <span className="mb-1 inline-flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Validacion previa
              </span>
              <p>
                El backend envia solo alimentos permitidos o razonables y recetas
                existentes. No se envian sintomas, tratamientos ni notas personales desde
                esta pantalla.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,11rem)_minmax(0,13rem)_minmax(0,1fr)]">
              <label className="grid gap-1.5 text-sm font-medium">
                Momento
                <select
                  value={mealTypePreference}
                  onChange={(event) =>
                    setMealTypePreference(event.target.value as AiMealTypePreference)
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {mealTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Enfoque
                <select
                  value={goalPreference}
                  onChange={(event) =>
                    setGoalPreference(event.target.value as AiGoalPreference)
                  }
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {goalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium">
                Notas opcionales
                <textarea
                  value={aiNotes}
                  onChange={(event) => setAiNotes(event.target.value)}
                  rows={2}
                  className="min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Ej. algo caliente, sin huevo, muy sencillo"
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Alimentos enviados a la IA</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Por defecto se seleccionan todos los alimentos razonables. Usa
                    busqueda y categoria para acotar lotes grandes.
                  </p>
                </div>
                <Badge variant={selectedFoodIds.size > 0 ? "secondary" : "outline"}>
                  {selectedFoodIds.size} de {reasonableFoods.length} seleccionados
                </Badge>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,14rem)_auto]">
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={foodSearch}
                    onChange={(event) => setFoodSearch(event.target.value)}
                    className="pl-9"
                    placeholder="Buscar alimento o etiqueta"
                    aria-label="Buscar alimento para enviar a la IA"
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-medium lg:gap-0">
                  <span className="sr-only">Categoria</span>
                  <select
                    value={foodCategoryFilter}
                    onChange={(event) => setFoodCategoryFilter(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">Todas las categorias</option>
                    {foodCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  type="button"
                  variant={showOnlySelectedFoods ? "default" : "outline"}
                  onClick={() => setShowOnlySelectedFoods((current) => !current)}
                >
                  {showOnlySelectedFoods && <Check aria-hidden="true" />}
                  Solo seleccionados
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={reasonableFoodIds.length === selectedFoodIds.size}
                  onClick={handleSelectAllFoods}
                >
                  <CheckCircle2 aria-hidden="true" />
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={selectedFoodIds.size === 0}
                  onClick={handleClearFoodSelection}
                >
                  <X aria-hidden="true" />
                  Quitar todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={
                    filteredReasonableFoods.length === 0 ||
                    selectedFilteredFoodIdsCount === filteredReasonableFoods.length
                  }
                  onClick={handleSelectVisibleFoods}
                >
                  Seleccionar visibles
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={selectedFilteredFoodIdsCount === 0}
                  onClick={handleClearVisibleFoodSelection}
                >
                  Quitar visibles
                </Button>
                {hasFoodSelectionFilters && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleClearFoodSelectionFilters}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <div className="rounded-md border bg-background">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
                  <span>
                    Mostrando {filteredReasonableFoods.length} alimentos
                    {hasFoodSelectionFilters ? " filtrados" : ""}.
                  </span>
                  <span>{selectedFilteredFoodIdsCount} visibles seleccionados</span>
                </div>

                {filteredReasonableFoods.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {filteredReasonableFoods.map((food) => {
                      const isSelected = selectedFoodIds.has(food.id);

                      return (
                        <label
                          key={food.id}
                          className="flex cursor-pointer gap-3 border-b px-3 py-2 last:border-b-0 hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleFood(food.id)}
                            className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{food.name}</span>
                              <Badge variant="outline">{food.category}</Badge>
                              <Badge variant="secondary">
                                Tolerancia {food.tolerance}/5
                              </Badge>
                            </span>
                            {food.tags.length > 0 && (
                              <span className="mt-1 block truncate text-xs text-muted-foreground">
                                {food.tags.slice(0, 5).join(", ")}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No hay alimentos que coincidan con los filtros actuales.
                  </div>
                )}
              </div>

              {selectedReasonableFoods.length > 0 && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {selectedReasonableFoods.slice(0, 8).map((food) => (
                    <Badge key={food.id} variant="outline">
                      {food.name}
                    </Badge>
                  ))}
                  {selectedReasonableFoods.length > 8 && (
                    <Badge variant="outline">
                      +{selectedReasonableFoods.length - 8} mas
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canGenerateWithAi}
                title={
                  selectedFoodIds.size > 0
                    ? "Generar con IA"
                    : "Selecciona al menos un alimento para generar con IA."
                }
                onClick={handleGenerateAiIdeas}
              >
                {generateAiMealIdeas.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles aria-hidden="true" />
                )}
                {generateAiMealIdeas.isPending ? "Generando..." : "Generar con IA"}
              </Button>
              {aiMealIdeas.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canGenerateWithAi}
                  onClick={handleGenerateAiIdeas}
                >
                  {generateAiMealIdeas.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RefreshCw aria-hidden="true" />
                  )}
                  Regenerar diferente
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setMode("basic")}>
                Ver sugerencias sin IA
              </Button>
            </div>

            {generateAiMealIdeas.error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{getErrorMessage(generateAiMealIdeas.error)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Calculando sugerencias...
        </div>
      )}

      {!isLoading && mealIdeas.length > 0 && !isAiMode && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mealIdeas.map((mealIdea) => (
            <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
          ))}
        </section>
      )}

      {!isLoading && mealIdeas.length > 0 && isAiMode && (
        <section className="space-y-3">
          {aiMealIdeas.length > 0 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold">Sugerencias generadas con IA</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Revisa cada propuesta con tu tolerancia personal antes de registrarla o
                  convertirla en receta.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {aiMealIdeas.map(({ key, mealIdea, suggestion }) => {
                  const isSaved = savedAiSuggestionKeys.has(key);

                  return (
                    <MealIdeaCard
                      key={key}
                      mealIdea={mealIdea}
                      actions={
                        <Button
                          type="button"
                          size="sm"
                          variant={isSaved ? "secondary" : "outline"}
                          disabled={!canCreateRecipeFromAi || isSaved}
                          title={
                            canCreateRecipeFromAi
                              ? "Guardar como receta"
                              : saveRecipeDisabledReason
                          }
                          onClick={() => handleOpenSaveRecipeDialog(suggestion)}
                        >
                          {isSaved ? (
                            <Check aria-hidden="true" />
                          ) : (
                            <Save aria-hidden="true" />
                          )}
                          {isSaved ? "Guardada" : "Guardar como receta"}
                        </Button>
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold">Sugerencias base disponibles</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Estas ideas sin IA serviran como respaldo y como entrada segura para el modo
              avanzado.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mealIdeas.slice(0, 3).map((mealIdea) => (
              <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && mealIdeas.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay sugerencias suficientes todavia. Anade alimentos permitidos y recetas con
          ingredientes reconocibles para generar ideas sin IA.
        </div>
      )}
    </div>
  );
}
