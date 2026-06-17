import { MealIdeasList } from "@/features/meal-ideas/meal-ideas-list";

export default function MealIdeasPage() {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-lg font-semibold">Sugerencias de comida</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Ideas basicas por reglas y modo avanzado preparado para futuras sugerencias con
          IA.
        </p>
      </section>
      <MealIdeasList />
    </div>
  );
}
