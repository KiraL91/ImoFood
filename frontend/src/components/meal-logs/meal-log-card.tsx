import { CalendarClock, CookingPot, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MealLog } from "@/lib/types/meal-log";
import { formatDateTime } from "@/lib/utils/format-date";

type MealLogCardProps = {
  mealLog: MealLog;
  recipeName?: string;
  foodNames?: string[];
};

export function MealLogCard({ mealLog, recipeName, foodNames = [] }: MealLogCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Utensils className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <CardTitle>{mealLog.description}</CardTitle>
            <CardDescription className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              {formatDateTime(mealLog.consumedAt)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recipeName && (
          <div className="rounded-md border bg-muted px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <CookingPot className="size-4 text-primary" aria-hidden="true" />
              {recipeName}
            </span>
          </div>
        )}

        {mealLog.notes && (
          <p className="text-sm leading-6 text-muted-foreground">{mealLog.notes}</p>
        )}

        {foodNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {foodNames.map((foodName) => (
              <Badge key={foodName} variant="secondary">
                {foodName}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
