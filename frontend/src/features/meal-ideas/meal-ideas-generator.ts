import type { Food } from "@/lib/types/food";
import type { MealIdea } from "@/lib/types/meal-idea";
import type { Recipe } from "@/lib/types/recipe";

type RecipeCandidate = {
  mealIdea: MealIdea;
  score: number;
};

type BuildMealIdeasOptions = {
  foods: Food[];
  limit?: number;
  recipes: Recipe[];
};

const defaultLimit = 8;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 4);
}

function foodMatchesIngredient(food: Food, ingredient: string) {
  const normalizedFood = normalizeText(food.name);
  const normalizedIngredient = normalizeText(ingredient);

  if (!normalizedFood || !normalizedIngredient) {
    return false;
  }

  if (
    normalizedIngredient.includes(normalizedFood) ||
    normalizedFood.includes(normalizedIngredient)
  ) {
    return true;
  }

  const ingredientTokens = new Set(tokenize(ingredient));

  return tokenize(food.name).some((token) => ingredientTokens.has(token));
}

function getIngredientMatches(ingredient: string, foods: Food[]) {
  return foods.filter((food) => foodMatchesIngredient(food, ingredient));
}

function isSafeFood(food: Food) {
  return food.status === "allowed" && food.tolerance >= 4;
}

function hasRiskyMatch(ingredient: string, foods: Food[]) {
  return getIngredientMatches(ingredient, foods).some(
    (food) => food.status === "avoid" || food.status === "caution",
  );
}

function buildRecipeCandidate(recipe: Recipe, foods: Food[]): RecipeCandidate | null {
  const safeIngredients = recipe.ingredients.filter((ingredient) =>
    getIngredientMatches(ingredient, foods).some(isSafeFood),
  );
  const testingIngredients = recipe.ingredients.filter((ingredient) =>
    getIngredientMatches(ingredient, foods).some((food) => food.status === "testing"),
  );
  const riskyIngredients = recipe.ingredients.filter((ingredient) =>
    hasRiskyMatch(ingredient, foods),
  );
  const unknownIngredients = recipe.ingredients.filter(
    (ingredient) => getIngredientMatches(ingredient, foods).length === 0,
  );

  if (riskyIngredients.length > 0 || safeIngredients.length === 0) {
    return null;
  }

  const ratingScore = recipe.rating ? recipe.rating * 4 : 0;
  const speedBonus = recipe.prepTimeMinutes <= 30 ? 8 : 0;
  const testingPenalty = testingIngredients.length * 3;
  const unknownPenalty = unknownIngredients.length;
  const score =
    safeIngredients.length * 12 +
    ratingScore +
    speedBonus -
    recipe.prepTimeMinutes / 5 -
    testingPenalty -
    unknownPenalty;
  const tags = [
    "receta",
    `${safeIngredients.length} seguros`,
    recipe.prepTimeMinutes <= 30 ? "rapida" : undefined,
    recipe.rating && recipe.rating >= 4 ? "bien valorada" : undefined,
    testingIngredients.length > 0 ? "revisar prueba" : undefined,
    unknownIngredients.length > 0 ? "revisar ingredientes" : undefined,
  ].filter(Boolean) as string[];
  const reasonParts = [
    `${safeIngredients.length} ingredientes coinciden con alimentos permitidos de alta tolerancia.`,
    recipe.rating ? `Valoracion ${recipe.rating}/5.` : undefined,
    recipe.prepTimeMinutes <= 30
      ? `Lista en ${recipe.prepTimeMinutes} minutos.`
      : `${recipe.prepTimeMinutes} minutos de preparacion.`,
    testingIngredients.length > 0
      ? `${testingIngredients.length} ingredientes estan en prueba.`
      : undefined,
    unknownIngredients.length > 0
      ? `${unknownIngredients.length} ingredientes no se han reconocido en alimentos.`
      : undefined,
  ].filter(Boolean);

  return {
    score,
    mealIdea: {
      description: recipe.description,
      id: `recipe-${recipe.id}`,
      items: recipe.ingredients,
      reason: reasonParts.join(" "),
      tags,
      title: recipe.name,
    },
  };
}

function includesAny(value: string, terms: string[]) {
  const normalizedValue = normalizeText(value);

  return terms.some((term) => normalizedValue.includes(normalizeText(term)));
}

function getSafeFoodByGroup(foods: Food[], groupTerms: string[]) {
  return foods.find((food) =>
    [food.category, ...food.tags, food.name].some((value) =>
      includesAny(value, groupTerms),
    ),
  );
}

function buildSimpleFoodIdeas(foods: Food[]): MealIdea[] {
  const safeFoods = foods
    .filter(isSafeFood)
    .sort((leftFood, rightFood) => rightFood.tolerance - leftFood.tolerance);
  const protein = getSafeFoodByGroup(safeFoods, ["proteina", "pollo", "huevo"]);
  const base = getSafeFoodByGroup(safeFoods, [
    "base",
    "cereal",
    "arroz",
    "patata",
    "tuberculo",
  ]);
  const vegetable = getSafeFoodByGroup(safeFoods, ["verdura", "hortaliza"]);
  const breakfast = getSafeFoodByGroup(safeFoods, ["desayuno", "lacteo", "fruta"]);
  const ideas: MealIdea[] = [];

  if (protein && base) {
    ideas.push({
      id: `safe-combo-${protein.id}-${base.id}`,
      items: [protein.name, base.name, vegetable?.name].filter(Boolean) as string[],
      reason:
        "Combinacion simple generada solo con alimentos permitidos y tolerancia alta.",
      tags: ["sin receta", "base segura", "alta tolerancia"],
      title: "Plato seguro con proteina y base",
    });
  }

  if (breakfast) {
    ideas.push({
      id: `safe-breakfast-${breakfast.id}`,
      items: [breakfast.name],
      reason: "Idea rapida a partir de un alimento permitido de alta tolerancia.",
      tags: ["sin receta", "rapida", "alta tolerancia"],
      title: "Opcion rapida segura",
    });
  }

  return ideas;
}

export function buildMealIdeas({
  foods,
  limit = defaultLimit,
  recipes,
}: BuildMealIdeasOptions): MealIdea[] {
  const recipeIdeas = recipes
    .map((recipe) => buildRecipeCandidate(recipe, foods))
    .filter((candidate): candidate is RecipeCandidate => Boolean(candidate))
    .sort((leftCandidate, rightCandidate) => rightCandidate.score - leftCandidate.score)
    .map((candidate) => candidate.mealIdea);
  const simpleFoodIdeas = buildSimpleFoodIdeas(foods);

  return [...recipeIdeas, ...simpleFoodIdeas].slice(0, limit);
}
