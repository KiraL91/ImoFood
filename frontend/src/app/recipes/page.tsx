import { RecipesExplorer } from "@/features/recipes/recipes-explorer";
import { recipes } from "@/lib/mock/recipes";

export default function RecipesPage() {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-lg font-semibold">Recetas base</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Preparaciones simples para ajustar ingredientes segun tolerancia.
        </p>
      </section>
      <RecipesExplorer recipes={recipes} />
    </div>
  );
}
