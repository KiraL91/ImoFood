"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, RotateCcw, Server } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { MealLogCard } from "@/components/meal-logs/meal-log-card";
import { MealLogFormDialog } from "@/components/meal-logs/meal-log-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateMealLogInput } from "@/features/meal-logs/meal-logs-api";
import {
  useCreateMealLog,
  useDeleteMealLog,
  useMealLogs,
  useUpdateMealLog,
} from "@/features/meal-logs/meal-logs-queries";
import { useRecipes } from "@/features/recipes/recipes-queries";
import { useSymptomLogs } from "@/features/symptoms/symptom-logs-queries";
import { env } from "@/lib/env";
import type { MealLog } from "@/lib/types/meal-log";
import type { SymptomLog } from "@/lib/types/symptom-log";
import { useAuth } from "@/providers/auth-provider";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function MealLogsPanel() {
  const [isMealLogDialogOpen, setIsMealLogDialogOpen] = useState(false);
  const [editingMealLog, setEditingMealLog] = useState<MealLog | undefined>();
  const [prefilledRecipeId, setPrefilledRecipeId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeIdFromQuery = searchParams.get("recipeId");
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateMealLog = hasPermission("meal-logs:create");
  const canUpdateMealLog = hasPermission("meal-logs:update");
  const canDeleteMealLog = hasPermission("meal-logs:delete");
  const canCreateSymptomLog = hasPermission("symptom-logs:create");
  const mealLogsQuery = useMealLogs();
  const symptomLogsQuery = useSymptomLogs();
  const createMealLogMutation = useCreateMealLog();
  const updateMealLogMutation = useUpdateMealLog();
  const deleteMealLogMutation = useDeleteMealLog();
  const recipesQuery = useRecipes();
  const mealLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (mealLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, mealLogsQuery.data],
  );
  const recipes = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (recipesQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, recipesQuery.data],
  );
  const symptomLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (symptomLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, symptomLogsQuery.data],
  );
  const symptomLogsByMealLogId = useMemo(() => {
    return symptomLogs.reduce((groupedSymptomLogs, symptomLog) => {
      if (!symptomLog.mealLogId) {
        return groupedSymptomLogs;
      }

      const groupedLogs = groupedSymptomLogs.get(symptomLog.mealLogId) ?? [];
      groupedLogs.push(symptomLog);
      groupedSymptomLogs.set(symptomLog.mealLogId, groupedLogs);

      return groupedSymptomLogs;
    }, new Map<string, SymptomLog[]>());
  }, [symptomLogs]);
  const hasDateFilter = Boolean(dateFrom || dateTo);
  const isDateRangeInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const filteredMealLogs = useMemo(() => {
    if (!hasDateFilter || isDateRangeInvalid) {
      return isDateRangeInvalid ? [] : mealLogs;
    }

    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined;

    return mealLogs.filter((mealLog) => {
      const consumedAt = new Date(mealLog.consumedAt);

      if (fromDate && consumedAt < fromDate) {
        return false;
      }

      if (toDate && consumedAt > toDate) {
        return false;
      }

      return true;
    });
  }, [dateFrom, dateTo, hasDateFilter, isDateRangeInvalid, mealLogs]);
  const prefilledRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === prefilledRecipeId),
    [prefilledRecipeId, recipes],
  );
  const isSubmitting = createMealLogMutation.isPending || updateMealLogMutation.isPending;
  const isFormDisabled =
    !hasBackendConfigured ||
    !isAuthenticated ||
    (editingMealLog ? !canUpdateMealLog : !canCreateMealLog);
  const disabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar historial contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para usar el CRUD real de historial."
      : editingMealLog
        ? "Tu rol no permite editar comidas."
        : "Tu rol no permite registrar comidas.";
  const canOpenCreateDialog = hasBackendConfigured && isAuthenticated && canCreateMealLog;
  const canRegisterSymptoms =
    hasBackendConfigured && isAuthenticated && canCreateSymptomLog;

  useEffect(() => {
    if (!recipeIdFromQuery) {
      return;
    }

    setEditingMealLog(undefined);
    setPrefilledRecipeId(recipeIdFromQuery);
    setMutationError(null);
    setIsMealLogDialogOpen(true);
    router.replace("/meal-logs");
  }, [recipeIdFromQuery, router]);

  async function handleMealLogSubmit(input: CreateMealLogInput) {
    setMutationError(null);

    try {
      if (editingMealLog) {
        await updateMealLogMutation.mutateAsync({
          id: editingMealLog.id,
          input,
        });
        setEditingMealLog(undefined);
        setIsMealLogDialogOpen(false);
        return;
      }

      await createMealLogMutation.mutateAsync(input);
      setPrefilledRecipeId(null);
      setIsMealLogDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleDeleteMealLog(mealLog: MealLog) {
    const confirmed = window.confirm(`Borrar "${mealLog.description}" del historial?`);

    if (!confirmed) {
      return;
    }

    setMutationError(null);

    try {
      await deleteMealLogMutation.mutateAsync(mealLog.id);

      if (editingMealLog?.id === mealLog.id) {
        setEditingMealLog(undefined);
      }
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  function handleOpenCreateMealLogDialog() {
    setMutationError(null);
    setPrefilledRecipeId(null);
    setEditingMealLog(undefined);
    setIsMealLogDialogOpen(true);
  }

  function handleEditMealLog(mealLog: MealLog) {
    setMutationError(null);
    setPrefilledRecipeId(null);
    setEditingMealLog(mealLog);
    setIsMealLogDialogOpen(true);
  }

  function handleMealLogDialogOpenChange(open: boolean) {
    setIsMealLogDialogOpen(open);

    if (!open) {
      setEditingMealLog(undefined);
      setPrefilledRecipeId(null);
      setMutationError(null);
    }
  }

  function handleRegisterSymptoms(mealLog: MealLog) {
    router.push(`/symptoms?mealLogId=${mealLog.id}`);
  }

  function handleClearDateFilter() {
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-5">
      <MealLogFormDialog
        disabledReason={disabledReason}
        errorMessage={mutationError}
        initialMealLog={editingMealLog}
        initialRecipe={prefilledRecipe}
        isDisabled={isFormDisabled}
        isOpen={isMealLogDialogOpen}
        isRecipesLoading={recipesQuery.isLoading}
        isSubmitting={isSubmitting}
        mode={editingMealLog ? "edit" : "create"}
        recipes={recipes}
        onCancel={() => {
          setEditingMealLog(undefined);
          setPrefilledRecipeId(null);
          setMutationError(null);
        }}
        onOpenChange={handleMealLogDialogOpenChange}
        onSubmit={handleMealLogSubmit}
      />

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Historial de comidas</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Comidas registradas para correlacionar con sintomas.
          </p>
        </div>
        <Button
          type="button"
          disabled={!canOpenCreateDialog}
          title={canOpenCreateDialog ? "Registrar comida" : disabledReason}
          onClick={handleOpenCreateMealLogDialog}
        >
          <Plus aria-hidden="true" />
          Registrar comida
        </Button>
      </section>

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando historial mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <CalendarDays
              className="mt-1 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <h4 className="text-sm font-medium">Buscar por rango de fechas</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Filtra las comidas por fecha de consumo.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_auto]">
            <label className="grid gap-1.5 text-sm font-medium">
              Desde
              <Input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onInput={(event) => setDateFrom(event.currentTarget.value)}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Hasta
              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onInput={(event) => setDateTo(event.currentTarget.value)}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              disabled={!hasDateFilter}
              onClick={handleClearDateFilter}
            >
              <RotateCcw aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </div>

        {isDateRangeInvalid ? (
          <p className="mt-3 text-sm text-destructive">
            La fecha inicial no puede ser posterior a la fecha final.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Mostrando {filteredMealLogs.length} de {mealLogs.length} entradas.
          </p>
        )}
      </section>

      {hasBackendConfigured && !isAuthenticated && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Inicia sesion en /login para consultar historial desde el backend.</p>
        </div>
      )}

      {mutationError && !isMealLogDialogOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {mealLogsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(mealLogsQuery.error)}
        </div>
      )}

      {symptomLogsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se han podido cargar los sintomas relacionados:{" "}
          {getErrorMessage(symptomLogsQuery.error)}
        </div>
      )}

      {mealLogsQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando historial...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredMealLogs.map((mealLog) => (
          <MealLogCard
            key={mealLog.id}
            canDelete={hasBackendConfigured && isAuthenticated && canDeleteMealLog}
            canEdit={hasBackendConfigured && isAuthenticated && canUpdateMealLog}
            canRegisterSymptoms={canRegisterSymptoms}
            isDeleting={
              deleteMealLogMutation.isPending &&
              deleteMealLogMutation.variables === mealLog.id
            }
            mealLog={mealLog}
            onDelete={handleDeleteMealLog}
            onEdit={handleEditMealLog}
            onRegisterSymptoms={handleRegisterSymptoms}
            symptomLogs={symptomLogsByMealLogId.get(mealLog.id)}
          />
        ))}
      </section>

      {!mealLogsQuery.isLoading && filteredMealLogs.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          {hasDateFilter
            ? "No hay comidas registradas en ese rango de fechas."
            : "Todavia no hay comidas registradas."}
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateDialog}
        title={canOpenCreateDialog ? "Registrar comida" : disabledReason}
        aria-label="Registrar comida"
        onClick={handleOpenCreateMealLogDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
