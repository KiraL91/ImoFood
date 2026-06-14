"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarClock, Plus, Server, Utensils } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SymptomLogCard } from "@/components/symptoms/symptom-log-card";
import { SymptomLogFormDialog } from "@/components/symptoms/symptom-log-form-dialog";
import { Button } from "@/components/ui/button";
import type { CreateSymptomLogInput } from "@/features/symptoms/symptom-logs-api";
import {
  useCreateSymptomLog,
  useDeleteSymptomLog,
  useSymptomLogs,
  useUpdateSymptomLog,
} from "@/features/symptoms/symptom-logs-queries";
import { useMealLogs } from "@/features/meal-logs/meal-logs-queries";
import { env } from "@/lib/env";
import type { SymptomLog } from "@/lib/types/symptom-log";
import { formatDateTime } from "@/lib/utils/format-date";
import { useAuth } from "@/providers/auth-provider";

const symptomSignals: Array<{
  key: keyof Pick<
    SymptomLog,
    "bloating" | "pain" | "gas" | "transit" | "energy" | "sleep"
  >;
  label: string;
}> = [
  { key: "bloating", label: "Hinchazon" },
  { key: "pain", label: "Dolor" },
  { key: "gas", label: "Gases" },
  { key: "transit", label: "Transito" },
  { key: "energy", label: "Energia" },
  { key: "sleep", label: "Sueno" },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function SymptomsPanel() {
  const [isSymptomLogDialogOpen, setIsSymptomLogDialogOpen] = useState(false);
  const [editingSymptomLog, setEditingSymptomLog] = useState<SymptomLog | undefined>();
  const [prefilledMealLogId, setPrefilledMealLogId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mealLogIdFromQuery = searchParams.get("mealLogId");
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateSymptomLog = hasPermission("symptom-logs:create");
  const canUpdateSymptomLog = hasPermission("symptom-logs:update");
  const canDeleteSymptomLog = hasPermission("symptom-logs:delete");
  const symptomLogsQuery = useSymptomLogs();
  const mealLogsQuery = useMealLogs();
  const createSymptomLogMutation = useCreateSymptomLog();
  const updateSymptomLogMutation = useUpdateSymptomLog();
  const deleteSymptomLogMutation = useDeleteSymptomLog();
  const symptomLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (symptomLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, symptomLogsQuery.data],
  );
  const mealLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (mealLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, mealLogsQuery.data],
  );
  const latestSymptomLog = symptomLogs[0];
  const latestHighestSignal = useMemo(() => {
    if (!latestSymptomLog) {
      return undefined;
    }

    return symptomSignals.reduce((highestSignal, signal) =>
      latestSymptomLog[signal.key] > latestSymptomLog[highestSignal.key]
        ? signal
        : highestSignal,
    );
  }, [latestSymptomLog]);
  const relatedSymptomLogsCount = useMemo(
    () =>
      symptomLogs.filter((symptomLog) => symptomLog.mealLogId || symptomLog.mealLog)
        .length,
    [symptomLogs],
  );
  const isSubmitting =
    createSymptomLogMutation.isPending || updateSymptomLogMutation.isPending;
  const isFormDisabled =
    !hasBackendConfigured ||
    !isAuthenticated ||
    (editingSymptomLog ? !canUpdateSymptomLog : !canCreateSymptomLog);
  const disabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar sintomas contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para usar el CRUD real de sintomas."
      : editingSymptomLog
        ? "Tu rol no permite editar sintomas."
        : "Tu rol no permite registrar sintomas.";
  const canOpenCreateDialog =
    hasBackendConfigured && isAuthenticated && canCreateSymptomLog;

  useEffect(() => {
    if (!mealLogIdFromQuery) {
      return;
    }

    setEditingSymptomLog(undefined);
    setPrefilledMealLogId(mealLogIdFromQuery);
    setMutationError(null);
    setIsSymptomLogDialogOpen(true);
    router.replace("/symptoms");
  }, [mealLogIdFromQuery, router]);

  async function handleSymptomLogSubmit(input: CreateSymptomLogInput) {
    setMutationError(null);

    try {
      if (editingSymptomLog) {
        await updateSymptomLogMutation.mutateAsync({
          id: editingSymptomLog.id,
          input,
        });
        setEditingSymptomLog(undefined);
        setPrefilledMealLogId(null);
        setIsSymptomLogDialogOpen(false);
        return;
      }

      await createSymptomLogMutation.mutateAsync(input);
      setPrefilledMealLogId(null);
      setIsSymptomLogDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleDeleteSymptomLog(symptomLog: SymptomLog) {
    const confirmed = window.confirm(
      `Borrar entrada de sintomas del ${formatDateTime(symptomLog.loggedAt)}?`,
    );

    if (!confirmed) {
      return;
    }

    setMutationError(null);

    try {
      await deleteSymptomLogMutation.mutateAsync(symptomLog.id);

      if (editingSymptomLog?.id === symptomLog.id) {
        setEditingSymptomLog(undefined);
      }
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  function handleOpenCreateSymptomLogDialog() {
    setMutationError(null);
    setEditingSymptomLog(undefined);
    setPrefilledMealLogId(null);
    setIsSymptomLogDialogOpen(true);
  }

  function handleEditSymptomLog(symptomLog: SymptomLog) {
    setMutationError(null);
    setPrefilledMealLogId(null);
    setEditingSymptomLog(symptomLog);
    setIsSymptomLogDialogOpen(true);
  }

  function handleSymptomLogDialogOpenChange(open: boolean) {
    setIsSymptomLogDialogOpen(open);

    if (!open) {
      setEditingSymptomLog(undefined);
      setPrefilledMealLogId(null);
      setMutationError(null);
    }
  }

  return (
    <div className="space-y-5">
      <SymptomLogFormDialog
        disabledReason={disabledReason}
        errorMessage={mutationError}
        initialMealLogId={prefilledMealLogId}
        initialSymptomLog={editingSymptomLog}
        isDisabled={isFormDisabled}
        isMealLogsLoading={mealLogsQuery.isLoading}
        isOpen={isSymptomLogDialogOpen}
        isSubmitting={isSubmitting}
        mealLogs={mealLogs}
        mode={editingSymptomLog ? "edit" : "create"}
        onCancel={() => {
          setEditingSymptomLog(undefined);
          setPrefilledMealLogId(null);
          setMutationError(null);
        }}
        onOpenChange={handleSymptomLogDialogOpenChange}
        onSubmit={handleSymptomLogSubmit}
      />

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Seguimiento de sintomas</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Registra sintomas y relacionalos con comidas para revisar patrones.
          </p>
        </div>
        <Button
          type="button"
          disabled={!canOpenCreateDialog}
          title={canOpenCreateDialog ? "Registrar entrada" : disabledReason}
          onClick={handleOpenCreateSymptomLogDialog}
        >
          <Plus aria-hidden="true" />
          Registrar entrada
        </Button>
      </section>

      <section
        aria-label="Resumen de sintomas"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            Ultima entrada
          </div>
          <p className="mt-2 text-sm font-semibold">
            {latestSymptomLog
              ? formatDateTime(latestSymptomLog.loggedAt)
              : "Sin registros"}
          </p>
        </div>

        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Activity className="size-4" aria-hidden="true" />
            Sintoma mas alto
          </div>
          <p className="mt-2 text-sm font-semibold">
            {latestSymptomLog && latestHighestSignal
              ? `${latestHighestSignal.label} ${latestSymptomLog[latestHighestSignal.key]}/10`
              : "Sin datos"}
          </p>
        </div>

        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Utensils className="size-4" aria-hidden="true" />
            Con comida relacionada
          </div>
          <p className="mt-2 text-sm font-semibold">
            {symptomLogs.length > 0
              ? `${relatedSymptomLogsCount}/${symptomLogs.length}`
              : "Sin registros"}
          </p>
        </div>

        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Server className="size-4" aria-hidden="true" />
            Entradas
          </div>
          <p className="mt-2 text-sm font-semibold">{symptomLogs.length}</p>
        </div>
      </section>

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando sintomas mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      {hasBackendConfigured && !isAuthenticated && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Inicia sesion en /login para consultar sintomas desde el backend.</p>
        </div>
      )}

      {mutationError && !isSymptomLogDialogOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {symptomLogsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(symptomLogsQuery.error)}
        </div>
      )}

      {mealLogsQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          No se ha podido cargar el historial para relacionar comidas:{" "}
          {getErrorMessage(mealLogsQuery.error)}
        </div>
      )}

      {symptomLogsQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando sintomas...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {symptomLogs.map((symptomLog) => (
          <SymptomLogCard
            key={symptomLog.id}
            canDelete={hasBackendConfigured && isAuthenticated && canDeleteSymptomLog}
            canEdit={hasBackendConfigured && isAuthenticated && canUpdateSymptomLog}
            isDeleting={
              deleteSymptomLogMutation.isPending &&
              deleteSymptomLogMutation.variables === symptomLog.id
            }
            symptomLog={symptomLog}
            onDelete={handleDeleteSymptomLog}
            onEdit={handleEditSymptomLog}
          />
        ))}
      </section>

      {!symptomLogsQuery.isLoading && symptomLogs.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          <p className="font-medium text-foreground">
            Todavia no hay sintomas registrados.
          </p>
          <p className="mx-auto mt-2 max-w-lg leading-6">
            Registra tu primera entrada para empezar a comparar evolucion y comidas
            relacionadas.
          </p>
          <Button
            type="button"
            className="mt-4"
            disabled={!canOpenCreateDialog}
            title={canOpenCreateDialog ? "Registrar entrada" : disabledReason}
            onClick={handleOpenCreateSymptomLogDialog}
          >
            <Plus aria-hidden="true" />
            Registrar entrada
          </Button>
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateDialog}
        title={canOpenCreateDialog ? "Registrar entrada" : disabledReason}
        aria-label="Registrar entrada"
        onClick={handleOpenCreateSymptomLogDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
