"use client";

import { useMemo, useState } from "react";
import { Plus, Server } from "lucide-react";
import { MealLogDraftCard } from "@/components/meal-logs/meal-log-draft-card";
import { MealLogCard } from "@/components/meal-logs/meal-log-card";
import { Button } from "@/components/ui/button";
import type { CreateMealLogInput } from "@/features/meal-logs/meal-logs-api";
import {
  useCreateMealLog,
  useDeleteMealLog,
  useMealLogs,
  useUpdateMealLog,
} from "@/features/meal-logs/meal-logs-queries";
import { env } from "@/lib/env";
import type { MealLog } from "@/lib/types/meal-log";
import { useAuth } from "@/providers/auth-provider";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function MealLogsPanel() {
  const [isDraftVisible, setIsDraftVisible] = useState(false);
  const [editingMealLog, setEditingMealLog] = useState<MealLog | undefined>();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateMealLog = hasPermission("meal-logs:create");
  const canUpdateMealLog = hasPermission("meal-logs:update");
  const canDeleteMealLog = hasPermission("meal-logs:delete");
  const mealLogsQuery = useMealLogs();
  const createMealLogMutation = useCreateMealLog();
  const updateMealLogMutation = useUpdateMealLog();
  const deleteMealLogMutation = useDeleteMealLog();
  const mealLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (mealLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, mealLogsQuery.data],
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
  const showDraft = isDraftVisible || Boolean(editingMealLog);

  async function handleMealLogSubmit(input: CreateMealLogInput) {
    setMutationError(null);

    try {
      if (editingMealLog) {
        await updateMealLogMutation.mutateAsync({
          id: editingMealLog.id,
          input,
        });
        setEditingMealLog(undefined);
        return;
      }

      await createMealLogMutation.mutateAsync(input);
      setIsDraftVisible(false);
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

  function handleOpenDraft() {
    setEditingMealLog(undefined);
    setIsDraftVisible((value) => !value);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Historial de comidas</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Comidas registradas para correlacionar con sintomas.
          </p>
        </div>
        <Button type="button" onClick={handleOpenDraft}>
          <Plus aria-hidden="true" />
          Registrar comida
        </Button>
      </section>

      {showDraft && (
        <MealLogDraftCard
          disabledReason={disabledReason}
          initialMealLog={editingMealLog}
          isDisabled={isFormDisabled}
          isSubmitting={isSubmitting}
          mode={editingMealLog ? "edit" : "create"}
          onCancel={() => setEditingMealLog(undefined)}
          onSubmit={handleMealLogSubmit}
        />
      )}

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando historial mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      {hasBackendConfigured && !isAuthenticated && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Inicia sesion en /login para consultar historial desde el backend.</p>
        </div>
      )}

      {mutationError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {mealLogsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(mealLogsQuery.error)}
        </div>
      )}

      {mealLogsQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando historial...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mealLogs.map((mealLog) => (
          <MealLogCard
            key={mealLog.id}
            canDelete={hasBackendConfigured && isAuthenticated && canDeleteMealLog}
            canEdit={hasBackendConfigured && isAuthenticated && canUpdateMealLog}
            isDeleting={
              deleteMealLogMutation.isPending &&
              deleteMealLogMutation.variables === mealLog.id
            }
            mealLog={mealLog}
            onDelete={handleDeleteMealLog}
            onEdit={setEditingMealLog}
          />
        ))}
      </section>

      {!mealLogsQuery.isLoading && mealLogs.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Todavia no hay comidas registradas.
        </div>
      )}
    </div>
  );
}
