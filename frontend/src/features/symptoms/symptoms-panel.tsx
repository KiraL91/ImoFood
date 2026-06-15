"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Filter,
  Plus,
  RotateCcw,
  Server,
  Utensils,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SymptomLogCard } from "@/components/symptoms/symptom-log-card";
import { SymptomLogFormDialog } from "@/components/symptoms/symptom-log-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type SymptomSignalKey = keyof Pick<
  SymptomLog,
  "bloating" | "pain" | "gas" | "transit" | "energy" | "sleep"
>;

const symptomSignals: Array<{
  key: SymptomSignalKey;
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

function getHighestSymptomSignal(symptomLog: SymptomLog) {
  const signal = symptomSignals.reduce((highestSignal, currentSignal) =>
    symptomLog[currentSignal.key] > symptomLog[highestSignal.key]
      ? currentSignal
      : highestSignal,
  );

  return {
    ...signal,
    score: symptomLog[signal.key],
  };
}

function isPrimarySymptomSignal(symptomLog: SymptomLog, signalKey: SymptomSignalKey) {
  const highestScore = getHighestSymptomSignal(symptomLog).score;

  return symptomLog[signalKey] === highestScore;
}

export function SymptomsPanel() {
  const [isSymptomLogDialogOpen, setIsSymptomLogDialogOpen] = useState(false);
  const [editingSymptomLog, setEditingSymptomLog] = useState<SymptomLog | undefined>();
  const [prefilledMealLogId, setPrefilledMealLogId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minimumSeverity, setMinimumSeverity] = useState(0);
  const [primarySymptomKey, setPrimarySymptomKey] = useState<"" | SymptomSignalKey>("");
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

    return getHighestSymptomSignal(latestSymptomLog);
  }, [latestSymptomLog]);
  const hasSymptomFilters = Boolean(
    dateFrom || dateTo || minimumSeverity > 0 || primarySymptomKey,
  );
  const isDateRangeInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const filteredSymptomLogs = useMemo(() => {
    if (isDateRangeInvalid) {
      return [];
    }

    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59.999`) : undefined;

    return symptomLogs.filter((symptomLog) => {
      const loggedAt = new Date(symptomLog.loggedAt);
      const highestSignal = getHighestSymptomSignal(symptomLog);

      if (fromDate && loggedAt < fromDate) {
        return false;
      }

      if (toDate && loggedAt > toDate) {
        return false;
      }

      if (highestSignal.score < minimumSeverity) {
        return false;
      }

      if (primarySymptomKey && !isPrimarySymptomSignal(symptomLog, primarySymptomKey)) {
        return false;
      }

      return true;
    });
  }, [
    dateFrom,
    dateTo,
    isDateRangeInvalid,
    minimumSeverity,
    primarySymptomKey,
    symptomLogs,
  ]);
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

  function handleClearSymptomFilters() {
    setDateFrom("");
    setDateTo("");
    setMinimumSeverity(0);
    setPrimarySymptomKey("");
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
          <h3 className="text-lg font-semibold">Diario de sintomas</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Registra sintomas cuando aparezcan y asocialos a una ingesta previa si aplica.
          </p>
        </div>
        <Button
          type="button"
          disabled={!canOpenCreateDialog}
          title={canOpenCreateDialog ? "Registrar sintomas" : disabledReason}
          onClick={handleOpenCreateSymptomLogDialog}
        >
          <Plus aria-hidden="true" />
          Registrar sintomas
        </Button>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-3">
            <Filter
              className="mt-1 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <h4 className="text-sm font-medium">Filtrar sintomas</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Acota el diario por fecha, intensidad y sintoma dominante.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,10rem)_minmax(0,10rem)_minmax(0,12rem)_minmax(0,12rem)_auto]">
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

            <label className="grid gap-1.5 text-sm font-medium">
              <span className="flex items-center justify-between gap-3">
                Severidad minima
                <span className="text-muted-foreground">{minimumSeverity}/10</span>
              </span>
              <input
                type="range"
                min="0"
                max="10"
                value={minimumSeverity}
                onChange={(event) => setMinimumSeverity(Number(event.target.value))}
                className="h-10 w-full accent-[var(--primary)]"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Sintoma principal
              <select
                value={primarySymptomKey}
                onChange={(event) =>
                  setPrimarySymptomKey(event.target.value as "" | SymptomSignalKey)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {symptomSignals.map((signal) => (
                  <option key={signal.key} value={signal.key}>
                    {signal.label}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              variant="outline"
              disabled={!hasSymptomFilters}
              onClick={handleClearSymptomFilters}
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
            Mostrando {filteredSymptomLogs.length} de {symptomLogs.length} entradas.
          </p>
        )}
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
              ? `${latestHighestSignal.label} ${latestHighestSignal.score}/10`
              : "Sin datos"}
          </p>
        </div>

        <div className="rounded-md border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Utensils className="size-4" aria-hidden="true" />
            Con ingesta relacionada
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
          No se ha podido cargar el historial para relacionar ingestas:{" "}
          {getErrorMessage(mealLogsQuery.error)}
        </div>
      )}

      {symptomLogsQuery.isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Cargando sintomas...
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSymptomLogs.map((symptomLog) => (
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

      {!symptomLogsQuery.isLoading && filteredSymptomLogs.length === 0 && (
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          <p className="font-medium text-foreground">
            {hasSymptomFilters
              ? "No hay sintomas que coincidan con los filtros."
              : "Todavia no hay sintomas registrados."}
          </p>
          <p className="mx-auto mt-2 max-w-lg leading-6">
            {hasSymptomFilters
              ? "Ajusta los filtros para ampliar el resultado."
              : "Registra tu primera entrada para empezar a comparar evolucion e ingestas relacionadas."}
          </p>
          {hasSymptomFilters ? (
            <Button
              type="button"
              className="mt-4"
              variant="outline"
              onClick={handleClearSymptomFilters}
            >
              <RotateCcw aria-hidden="true" />
              Limpiar filtros
            </Button>
          ) : (
            <Button
              type="button"
              className="mt-4"
              disabled={!canOpenCreateDialog}
              title={canOpenCreateDialog ? "Registrar sintomas" : disabledReason}
              onClick={handleOpenCreateSymptomLogDialog}
            >
              <Plus aria-hidden="true" />
              Registrar sintomas
            </Button>
          )}
        </div>
      )}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateDialog}
        title={canOpenCreateDialog ? "Registrar sintomas" : disabledReason}
        aria-label="Registrar sintomas"
        onClick={handleOpenCreateSymptomLogDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
