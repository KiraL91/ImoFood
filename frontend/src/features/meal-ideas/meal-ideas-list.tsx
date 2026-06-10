import { MealIdeaCard } from "@/components/meal-ideas/meal-idea-card";
import type { MealIdea } from "@/lib/types/meal-idea";

type MealIdeasListProps = {
  mealIdeas: MealIdea[];
};

export function MealIdeasList({ mealIdeas }: MealIdeasListProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mealIdeas.map((mealIdea) => (
        <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
      ))}
    </section>
  );
}
