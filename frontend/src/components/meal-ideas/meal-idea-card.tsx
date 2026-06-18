import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealIdea } from "@/lib/types/meal-idea";
import type { ReactNode } from "react";

type MealIdeaCardProps = {
  actions?: ReactNode;
  mealIdea: MealIdea;
};

export function MealIdeaCard({ actions, mealIdea }: MealIdeaCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Lightbulb className="size-4" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>{mealIdea.title}</CardTitle>
            {(mealIdea.description || mealIdea.reason) && (
              <CardDescription>{mealIdea.description ?? mealIdea.reason}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealIdea.description && mealIdea.reason && (
          <p className="text-sm leading-6 text-muted-foreground">{mealIdea.reason}</p>
        )}
        <ul className="space-y-2 text-sm leading-6">
          {mealIdea.items.map((item) => (
            <li key={item} className="rounded-md border bg-muted px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {mealIdea.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
