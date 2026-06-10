import { MealIdeasList } from "@/features/meal-ideas/meal-ideas-list";
import { mealIdeas } from "@/lib/mock/meal-ideas";

export default function MealIdeasPage() {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-lg font-semibold">Sugerencias de comida</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Combinaciones iniciales basadas en alimentos mock y tolerancia.
        </p>
      </section>
      <MealIdeasList mealIdeas={mealIdeas} />
    </div>
  );
}
