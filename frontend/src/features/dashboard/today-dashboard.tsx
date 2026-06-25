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

type TimelineEvent = {
  id: string;
  at: string;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

type FollowUpCard = {
  action: string;
  description: string;
  href: string;
  icon: LucideIcon;
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
  const todayKey = getDateKey(new Date().toISOString());
  const todaysEvents = timelineEvents
    .filter((event) => getDateKey(event.at) === todayKey)
    .sort(
      (leftEvent, rightEvent) =>
        new Date(leftEvent.at).getTime() - new Date(rightEvent.at).getTime(),
    );
  const latestTodayEvent = todaysEvents[todaysEvents.length - 1];
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
  const quickMealIdea = buildMealIdeas({
    foods,
    limit: 2,
    recipes,
  })[0];
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
      helper: "registradas hoy",
      value: isLoading ? "..." : todaysMealLogs.length,
    },
    {
      href: "/symptoms",
      icon: Activity,
      label: "Sintomas",
      helper: "entradas hoy",
      value: isLoading ? "..." : todaysSymptomLogs.length,
    },
    {
      href: "/treatments",
      icon: Pill,
      label: "Tratamientos",
      helper: "activos",
      value: isLoading ? "..." : activeTreatmentsCount,
    },
    {
      href: "/meal-logs",
      icon: Clock3,
      label: "Ultimo hoy",
      helper: "registro diario",
      value: latestTodayEvent ? formatTime(latestTodayEvent.at) : "-",
    },
  ];
  const latestMealLogQuery = latestMealLog
    ? encodeURIComponent(latestMealLog.id)
    : undefined;
  const followUps: FollowUpCard[] = [
    latestMealLog
      ? symptomsAfterLatestMeal
        ? {
            action: "Ver sintomas",
            description: "La ultima ingesta ya tiene sintomas posteriores registrados.",
            href: "/symptoms",
            icon: Activity,
            title: "Sintomas revisados",
          }
        : {
            action: "Registrar sintomas",
            description:
              "La ultima ingesta todavia no tiene sintomas posteriores asociados.",
            href: `/symptoms?mealLogId=${latestMealLogQuery}`,
            icon: Activity,
            title: "Completar seguimiento",
          }
      : {
          action: "Registrar ingesta",
          description: "Registra una ingesta para poder relacionar sintomas despues.",
          href: "/meal-logs?open=1",
          icon: Utensils,
          title: "Primera ingesta",
        },
    activeTreatmentsCount > 0
      ? {
          action: "Registrar toma",
          description: `${activeTreatmentsCount} tratamientos activos para revisar en el seguimiento.`,
          href: "/treatments?openLog=1",
          icon: Pill,
          title: "Tratamientos activos",
        }
      : {
          action: "Anadir tratamiento",
          description: "No hay tratamientos activos registrados.",
          href: "/treatments?openTreatment=1",
          icon: Pill,
          title: "Tratamiento pendiente",
        },
    latestMealLog?.foods?.length
      ? {
          action: "Ver ingesta",
          description:
            "La ultima ingesta incluye alimentos concretos para poder cruzarlos despues.",
          href: "/meal-logs",
          icon: Utensils,
          title: "Alimentos asociados",
        }
      : {
          action: latestMealLog ? "Completar ingesta" : "Registrar ingesta",
          description: latestMealLog
            ? "La ultima ingesta no tiene alimentos concretos asociados."
            : "Anade alimentos concretos al registrar una ingesta.",
          href: latestMealLog
            ? `/meal-logs?editMealLogId=${latestMealLogQuery}`
            : "/meal-logs?open=1",
          icon: Utensils,
          title: "Alimentos pendientes",
        },
  ];
  const quickActions = [
    {
      href: "/meal-logs?open=1",
      icon: Utensils,
      label: "Ingesta",
      variant: "default" as const,
    },
    {
      href:
        latestMealLog && !symptomsAfterLatestMeal
          ? `/symptoms?mealLogId=${latestMealLogQuery}`
          : "/symptoms?open=1",
      icon: ClipboardList,
      label: "Sintomas",
      variant: "outline" as const,
    },
    {
      href:
        activeTreatmentsCount > 0
          ? "/treatments?openLog=1"
          : "/treatments?openTreatment=1",
      icon: Pill,
      label: "Toma",
      variant: "outline" as const,
    },
    {
      href: "/foods",
      icon: Search,
      label: "Alimento",
      variant: "outline" as const,
    },
  ];
  const secondaryActions = [
    {
      href: "/meal-logs",
      icon: Clock3,
      label: "Mi diario",
    },
    {
      href: "/meal-ideas",
      icon: Lightbulb,
      label: "Ideas",
    },
    {
      href: "/recipes",
      icon: CookingPot,
      label: "Recetas",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDay(new Date().toISOString())}
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Hoy</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Registra lo importante del dia y revisa de un vistazo comida, sintomas y
                tratamiento.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[30rem]">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button key={action.label} asChild variant={action.variant}>
                  <Link href={action.href}>
                    {action.label === "Ingesta" ? (
                      <Plus aria-hidden="true" />
                    ) : (
                      <Icon aria-hidden="true" />
                    )}
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md border bg-background px-4 py-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </span>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {!env.NEXT_PUBLIC_API_BASE_URL && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Configura NEXT_PUBLIC_API_BASE_URL para cargar datos reales.</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(errors[0])}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
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
                    : `${todaysEvents.length} registros: ${todaysMealLogs.length} ingestas, ${todaysSymptomLogs.length} sintomas y ${todaysTreatmentLogs.length} tomas.`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                Cargando la linea temporal de hoy...
              </div>
            ) : todaysEvents.length > 0 ? (
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
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
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

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Lightbulb className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Pendiente</CardTitle>
                  <CardDescription>
                    Acciones que mantienen completo el dia.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {followUps.map((followUp) => {
                const Icon = followUp.icon;

                return (
                  <Link
                    key={followUp.title}
                    href={followUp.href}
                    className="group block rounded-md border bg-background px-3 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex gap-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-background">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">
                          {followUp.title}
                        </span>
                        <span className="mt-1 block leading-6 text-muted-foreground">
                          {followUp.description}
                        </span>
                        <span className="mt-2 flex items-center gap-1 font-medium text-primary">
                          {followUp.action}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ahora puedes</CardTitle>
              <CardDescription>
                Accesos utiles sin salir del flujo diario.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {secondaryActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button key={action.label} asChild variant="outline">
                    <Link href={action.href} className="justify-start">
                      <Icon aria-hidden="true" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <CookingPot className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>Idea rapida</CardTitle>
                  <CardDescription>
                    Una opcion sencilla para decidir la siguiente comida.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickMealIdea ? (
                <>
                  <div>
                    <h3 className="font-semibold">{quickMealIdea.title}</h3>
                    {quickMealIdea.reason && (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {quickMealIdea.reason}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {quickMealIdea.items.slice(0, 3).map((item) => (
                      <li key={item} className="rounded-md border bg-muted px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : quickRecipe ? (
                <div>
                  <h3 className="font-semibold">{quickRecipe.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {quickRecipe.prepTimeMinutes} minutos
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Anade recetas y alimentos permitidos para generar ideas rapidas.
                </p>
              )}
              <Button asChild className="w-full" variant="outline">
                <Link href="/meal-ideas">
                  Ver ideas
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
