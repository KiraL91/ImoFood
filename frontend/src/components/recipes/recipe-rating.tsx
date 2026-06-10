"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { RecipeRatingValue } from "@/lib/types/recipe";
import { cn } from "@/lib/utils/cn";

type RecipeRatingProps = {
  initialRating?: RecipeRatingValue;
};

const ratingValues: RecipeRatingValue[] = [1, 2, 3, 4, 5];

export function RecipeRating({ initialRating }: RecipeRatingProps) {
  const [rating, setRating] = useState<RecipeRatingValue | undefined>(initialRating);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">Puntuacion</p>
        <p className="text-xs text-muted-foreground">
          {rating ? `${rating}/5` : "Sin puntuar"}
        </p>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label="Puntuar receta">
        {ratingValues.map((value) => {
          const isSelected = rating !== undefined && value <= rating;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`Puntuar con ${value} estrella${value === 1 ? "" : "s"}`}
              title={`${value}/5`}
              onClick={() => setRating(value)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Star
                className={cn(
                  "size-5",
                  isSelected && "fill-accent text-accent-foreground",
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
