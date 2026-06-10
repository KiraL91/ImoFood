import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CircleAlert,
  CookingPot,
  FlaskConical,
  Lightbulb,
  Pill,
  Utensils,
} from "lucide-react";
import { MealIdeaCard } from "@/components/meal-ideas/meal-idea-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { foods } from "@/lib/mock/foods";
import { mealIdeas } from "@/lib/mock/meal-ideas";
import { mealLogs } from "@/lib/mock/meal-logs";
import { recipes } from "@/lib/mock/recipes";
import { symptomLogs } from "@/lib/mock/symptom-logs";
import { treatmentLogs } from "@/lib/mock/treatment-logs";
import { treatments } from "@/lib/mock/treatments";
import { formatDateTime } from "@/lib/utils/format-date";

const dashboardStats = [
  {
    label: "Permitidos",
    value: foods.filter((food) => food.status === "allowed").length,
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-800",
  },
  {
    label: "En prueba",
    value: foods.filter((food) => food.status === "testing").length,
    icon: FlaskConical,
    className: "bg-sky-50 text-sky-800",
  },
  {
    label: "Dudosos",
    value: foods.filter((food) => food.status === "caution").length,
    icon: CircleAlert,
    className: "bg-amber-50 text-amber-800",
  },
  {
    label: "Recetas",
    value: recipes.length,
    icon: CookingPot,
    className: "bg-secondary text-secondary-foreground",
  },
];

export default function DashboardPage() {
  const quickRecipe = recipes[0];
  const featuredIdeas = mealIdeas.slice(0, 2);
  const latestMealLog = mealLogs[0];
  const latestSymptomLog = symptomLogs[0];
  const latestTreatmentLog = treatmentLogs[0];
  const latestTreatment = treatments.find(
    (treatment) => treatment.id === latestTreatmentLog.treatmentId,
  );
  const activeTreatmentsCount = treatments.filter(
    (treatment) => treatment.status === "active",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div
                  className={`flex size-9 items-center justify-center rounded-md ${stat.className}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Utensils className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Ultima comida registrada</CardTitle>
                <CardDescription>
                  {formatDateTime(latestMealLog.consumedAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{latestMealLog.description}</p>
            {latestMealLog.notes && (
              <p className="text-sm leading-6 text-muted-foreground">
                {latestMealLog.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Activity className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Ultima entrada de sintomas</CardTitle>
                <CardDescription>
                  {formatDateTime(latestSymptomLog.loggedAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md border bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">Hinchazon</p>
              <p className="font-semibold">{latestSymptomLog.bloating}/10</p>
            </div>
            <div className="rounded-md border bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">Dolor</p>
              <p className="font-semibold">{latestSymptomLog.pain}/10</p>
            </div>
            <div className="rounded-md border bg-muted px-3 py-2">
              <p className="text-xs text-muted-foreground">Energia</p>
              <p className="font-semibold">{latestSymptomLog.energy}/10</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Pill className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Ultima toma registrada</CardTitle>
                <CardDescription>
                  {formatDateTime(latestTreatmentLog.takenAt)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{latestTreatment?.name ?? "Tratamiento"}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {activeTreatmentsCount} tratamientos activos
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-3 rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">Accesos rapidos</h3>
          <Button asChild>
            <Link href="/meal-logs">
              <Utensils aria-hidden="true" />
              Registrar comida
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/symptoms">
              <ClipboardList aria-hidden="true" />
              Registrar sintomas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/treatments">
              <Pill aria-hidden="true" />
              Registrar toma
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Que puedo comer ahora</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ideas con alimentos conocidos y baja friccion.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/meal-ideas">
                Ver ideas
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredIdeas.map((mealIdea) => (
              <MealIdeaCard key={mealIdea.id} mealIdea={mealIdea} />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Lightbulb className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Receta rapida</CardTitle>
                <CardDescription>{quickRecipe.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{quickRecipe.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {quickRecipe.prepTimeMinutes} minutos
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickRecipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button asChild className="w-full">
              <Link href="/recipes">
                Abrir recetas
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
