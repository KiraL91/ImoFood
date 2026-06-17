"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock3,
  CookingPot,
  Lightbulb,
  Pill,
  Plus,
  Search,
  Server,
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
import { useFoods } from "@/features/foods/foods-queries";
import { buildMealIdeas } from "@/features/meal-ideas/meal-ideas-generator";
import { useMealLogs } from "@/features/meal-logs/meal-logs-queries";
import { useRecipes } from "@/features/recipes/recipes-queries";
import { useSymptomLogs } from "@/features/symptoms/symptom-logs-queries";
import {
  useTreatmentLogs,
  useTreatments,
} from "@/features/treatments/treatments-queries";
import { env } from "@/lib/env";
import type { MealLog } from "@/lib/types/meal-log";
import type { Recipe } from "@/lib/types/recipe";
import type { SymptomLog } from "@/lib/types/symptom-log";
import type { Treatment, TreatmentLog } from "@/lib/types/treatment";
import { formatDateTime } from "@/lib/utils/format-date";

type TimelineEvent = {
  id: string;
  at: string;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "full",
  timeZone: "Europe/Madrid",
});

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Madrid",
  year: "numeric",
});

function getDateKey(value: string) {
  const parts = Object.fromEntries(
    dateKeyFormatter
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

function formatDay(value: string) {
  return dayFormatter.format(new Date(value));
}

function sortByNewestDate<T>(items: T[], getDate: (item: T) => string) {
  return [...items].sort(
    (leftItem, rightItem) =>
      new Date(getDate(rightItem)).getTime() - new Date(getDate(leftItem)).getTime(),
  );
}

function buildTimelineEvents(
  mealLogs: MealLog[],
  symptomLogs: SymptomLog[],
  treatmentLogs: TreatmentLog[],
  treatments: Treatment[],
): TimelineEvent[] {
  const mealEvents = mealLogs.map((mealLog) => ({
    at: mealLog.consumedAt,
    description:
      mealLog.foods && mealLog.foods.length > 0
        ? mealLog.foods.map((food) => food.name).join(", ")
        : (mealLog.notes ?? "Ingesta registrada"),
    href: "/meal-logs",
    icon: Utensils,
    id: `meal-${mealLog.id}`,
    label: "Ingesta",
    title: mealLog.description,
  }));

  const symptomEvents = symptomLogs.map((symptomLog) => ({
    at: symptomLog.loggedAt,
    description: `Hinchazon ${symptomLog.bloating}/10 - dolor ${symptomLog.pain}/10 - energia ${symptomLog.energy}/10`,
    href: "/symptoms",
    icon: Activity,
    id: `symptom-${symptomLog.id}`,
    label: "Sintomas",
    title: symptomLog.mealLog
      ? `Revision tras ${symptomLog.mealLog.description}`
      : "Sintomas registrados",
  }));

  const treatmentEvents = treatmentLogs.map((treatmentLog) => {
    const treatment = treatments.find((item) => item.id === treatmentLog.treatmentId);

    return {
      at: treatmentLog.takenAt,
      description: treatmentLog.dose ?? treatmentLog.notes ?? "Toma registrada",
      href: "/treatments",
      icon: Pill,
      id: `treatment-${treatmentLog.id}`,
      label: "Tratamiento",
      title: treatment?.name ?? "Toma registrada",
    };
  });

  return [...mealEvents, ...symptomEvents, ...treatmentEvents].sort(
    (leftEvent, rightEvent) =>
      new Date(rightEvent.at).getTime() - new Date(leftEvent.at).getTime(),
  );
}

function getQuickRecipe(recipes: Recipe[]) {
  return recipes.find((recipe) => recipe.prepTimeMinutes <= 30) ?? recipes[0];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se han podido cargar los datos del dashboard.";
}

export function TodayDashboard() {
  const mealLogsQuery = useMealLogs();
  const symptomLogsQuery = useSymptomLogs();
  const recipesQuery = useRecipes();
  const foodsQuery = useFoods();
  const treatmentsQuery = useTreatments();
  const treatmentLogsQuery = useTreatmentLogs();
  const mealLogs = sortByNewestDate(
    mealLogsQuery.data ?? [],
    (mealLog) => mealLog.consumedAt,
  );
  const symptomLogs = sortByNewestDate(
    symptomLogsQuery.data ?? [],
    (symptomLog) => symptomLog.loggedAt,
  );
  const recipes = recipesQuery.data ?? [];
  const foods = foodsQuery.data ?? [];
  const treatments = treatmentsQuery.data ?? [];
  const treatmentLogs = sortByNewestDate(
    treatmentLogsQuery.data ?? [],
    (treatmentLog) => treatmentLog.takenAt,
  );
  const timelineEvents = buildTimelineEvents(
    mealLogs,
    symptomLogs,
    treatmentLogs,
    treatments,
  );
  const latestEvent = timelineEvents[0];
  const todayKey = getDateKey(new Date().toISOString());
  const todaysEvents = timelineEvents
    .filter((event) => getDateKey(event.at) === todayKey)
    .sort(
      (leftEvent, rightEvent) =>
        new Date(leftEvent.at).getTime() - new Date(rightEvent.at).getTime(),
    );
  const todaysMealLogs = mealLogs.filter(
    (mealLog) => getDateKey(mealLog.consumedAt) === todayKey,
  );
  const todaysSymptomLogs = symptomLogs.filter(
    (symptomLog) => getDateKey(symptomLog.loggedAt) === todayKey,
  );
  const todaysTreatmentLogs = treatmentLogs.filter(
    (treatmentLog) => getDateKey(treatmentLog.takenAt) === todayKey,
  );
  const latestMealLog = mealLogs[0];
  const latestSymptomLog = symptomLogs[0];
  const activeTreatmentsCount = treatments.filter(
    (treatment) => treatment.status === "active",
  ).length;
  const symptomsAfterLatestMeal = latestMealLog
    ? symptomLogs.some(
        (symptomLog) =>
          new Date(symptomLog.loggedAt).getTime() >
          new Date(latestMealLog.consumedAt).getTime(),
      )
    : false;
  const featuredIdeas = buildMealIdeas({
    foods,
    limit: 2,
    recipes,
  });
  const quickRecipe = getQuickRecipe(recipes);
  const isLoading =
    mealLogsQuery.isLoading ||
    symptomLogsQuery.isLoading ||
    recipesQuery.isLoading ||
    foodsQuery.isLoading ||
    treatmentsQuery.isLoading ||
    treatmentLogsQuery.isLoading;
  const errors = [
    mealLogsQuery.error,
    symptomLogsQuery.error,
    recipesQuery.error,
    foodsQuery.error,
    treatmentsQuery.error,
    treatmentLogsQuery.error,
  ].filter(Boolean);
  const summaryCards = [
    {
      href: "/meal-logs",
      icon: Utensils,
      label: "Ingestas",
      value: isLoading ? "..." : todaysMealLogs.length,
    },
    {
      href: "/symptoms",
      icon: Activity,
      label: "Sintomas",
      value: isLoading ? "..." : todaysSymptomLogs.length,
    },
    {
      href: "/treatments",
      icon: Pill,
      label: "Tratamientos",
      value: isLoading ? "..." : activeTreatmentsCount,
    },
    {
      href: "/meal-logs",
      icon: Clock3,
      label: "Ultimo registro",
      value: latestEvent ? formatTime(latestEvent.at) : "-",
    },
  ];
  const reminders = [
    latestMealLog && symptomsAfterLatestMeal
      ? "La ultima ingesta ya tiene sintomas posteriores registrados."
      : "La ultima ingesta todavia no tiene sintomas posteriores asociados.",
    activeTreatmentsCount > 0
      ? `${activeTreatmentsCount} tratamientos activos para revisar en el seguimiento.`
      : "No hay tratamientos activos registrados.",
    latestMealLog?.foods?.length
      ? "La ultima ingesta incluye alimentos concretos para poder cruzarlos despues."
      : "La ultima ingesta no tiene alimentos concretos asociados.",
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDay(new Date().toISOString())}
            </div>
            <div>
              <h3 className="text-xl font-semibold">Seguimiento de hoy</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Datos cargados desde tus registros disponibles.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild>
              <Link href="/meal-logs">
                <Plus aria-hidden="true" />
                Ingesta
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/symptoms">
                <ClipboardList aria-hidden="true" />
                Sintomas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/treatments">
                <Pill aria-hidden="true" />
                Toma
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/foods">
                <Search aria-hidden="true" />
                Alimento
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {!env.NEXT_PUBLIC_API_BASE_URL && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando datos mock. Configura NEXT_PUBLIC_API_BASE_URL para usar el backend.
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(errors[0])}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{item.value}</p>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
                  <Link href={item.href}>
                    Abrir
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Clock3 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Hoy hasta ahora</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Cargando registros..."
                    : `${todaysEvents.length} registros hoy: ${todaysMealLogs.length} ingestas, ${todaysSymptomLogs.length} sintomas y ${todaysTreatmentLogs.length} tomas.`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todaysEvents.length > 0 ? (
              <div className="space-y-4">
                {todaysEvents.map((event) => {
                  const Icon = event.icon;

                  return (
                    <Link
                      key={event.id}
                      href={event.href}
                      className="flex gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md bg-muted px-2 py-1 text-center text-xs font-medium">
                        {formatTime(event.at)}
                      </div>
                      <div className="flex min-w-0 flex-1 gap-3">
                        <Icon
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{event.title}</p>
                            <Badge variant="secondary">{event.label}</Badge>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                Todavia no hay registros para mostrar.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Lightbulb className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Puntos de seguimiento</CardTitle>
                <CardDescription>
                  Recordatorios simples del flujo comida-sintomas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder}
                className="rounded-md border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground"
              >
                {reminder}
              </div>
            ))}
            {latestMealLog && (
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                <p className="font-medium">{latestMealLog.description}</p>
                <p className="mt-1 text-muted-foreground">
                  Ultima ingesta: {formatDateTime(latestMealLog.consumedAt)}
                </p>
              </div>
            )}
            {latestSymptomLog && (
              <div className="grid grid-cols-3 gap-2 text-sm">
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
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Proxima comida</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ideas sencillas para decidir sin salir de la pantalla principal.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/meal-ideas">
                Ideas
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
              <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <CookingPot className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Receta rapida</CardTitle>
                <CardDescription>
                  {quickRecipe?.description ?? "No hay recetas disponibles todavia."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickRecipe ? (
              <>
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
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Crea una receta para que aparezca aqui como acceso rapido.
              </p>
            )}
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
