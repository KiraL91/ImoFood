"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FoodCard } from "@/components/foods/food-card";
import { NewFoodDraftCard } from "@/components/foods/new-food-draft-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { foodStatusMeta, foodStatusOrder } from "@/lib/constants/status";
import type { Food, FoodStatus } from "@/lib/types/food";
import { cn } from "@/lib/utils/cn";

type FoodsExplorerProps = {
  foods: Food[];
};

type FilterValue = FoodStatus | "all";

export function FoodsExplorer({ foods }: FoodsExplorerProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterValue>("all");

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foods.filter((food) => {
      const matchesStatus = status === "all" || food.status === status;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [food.name, food.category, food.notes, ...food.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [foods, query, status]);

  return (
    <div className="space-y-5">
      <NewFoodDraftCard />

      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar alimento, categoria o etiqueta"
              className="pl-9"
              aria-label="Buscar alimentos"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={status === "all" ? "default" : "outline"}
              onClick={() => setStatus("all")}
            >
              Todos
            </Button>
            {foodStatusOrder.map((foodStatus) => {
              const meta = foodStatusMeta[foodStatus];

              return (
                <Button
                  key={foodStatus}
                  type="button"
                  size="sm"
                  variant={status === foodStatus ? "default" : "outline"}
                  onClick={() => setStatus(foodStatus)}
                >
                  <span
                    className={cn("size-2 rounded-full", meta.dotClassName)}
                    aria-hidden="true"
                  />
                  {meta.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredFoods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </section>

      {filteredFoods.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay alimentos que coincidan con el filtro actual.
        </div>
      )}
    </div>
  );
}
