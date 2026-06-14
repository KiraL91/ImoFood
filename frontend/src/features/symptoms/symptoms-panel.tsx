"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarClock, ClipboardList, Plus, Server } from "lucide-react";
import { SymptomLogCard } from "@/components/symptoms/symptom-log-card";
import { SymptomLogFormDialog } from "@/components/symptoms/symptom-log-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CreateSymptomLogInput } from "@/features/symptoms/symptom-logs-api";
import {
  useCreateSymptomLog,
  useDeleteSymptomLog,
  useSymptomLogs,
  useUpdateSymptomLog,
} from "@/features/symptoms/symptom-logs-queries";
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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateSymptomLog = hasPermission("symptom-logs:create");
  const canUpdateSymptomLog = hasPermission("symptom-logs:update");
  const canDeleteSymptomLog = hasPermission("symptom-logs:delete");
  const symptomLogsQuery = useSymptomLogs();
  const createSymptomLogMutation = useCreateSymptomLog();
  const updateSymptomLogMutation = useUpdateSymptomLog();
  const deleteSymptomLogMutation = useDeleteSymptomLog();
  const symptomLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (symptomLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, symptomLogsQuery.data],
  );
  const latestSymptomLog = symptomLogs[0];
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

  async function handleSymptomLogSubmit(input: CreateSymptomLogInput) {
    setMutationError(null);

    try {
      if (editingSymptomLog) {
        await updateSymptomLogMutation.mutateAsync({
          id: editingSymptomLog.id,
          input,
        });
        setEditingSymptomLog(undefined);
        setIsSymptomLogDialogOpen(false);
        return;
      }

      await createSymptomLogMutation.mutateAsync(input);
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
    setIsSymptomLogDialogOpen(true);
  }

  function handleEditSymptomLog(symptomLog: SymptomLog) {
    setMutationError(null);
    setEditingSymptomLog(symptomLog);
    setIsSymptomLogDialogOpen(true);
  }

  function handleSymptomLogDialogOpenChange(open: boolean) {
    setIsSymptomLogDialogOpen(open);

    if (!open) {
      setEditingSymptomLog(undefined);
      setMutationError(null);
    }
  }

  return (
    <div className="space-y-5">
      <SymptomLogFormDialog
        disabledReason={disabledReason}
        errorMessage={mutationError}
        initialSymptomLog={editingSymptomLog}
        isDisabled={isFormDisabled}
        isOpen={isSymptomLogDialogOpen}
        isSubmitting={isSubmitting}
        mode={editingSymptomLog ? "edit" : "create"}
        onCancel={() => {
          setEditingSymptomLog(undefined);
          setMutationError(null);
        }}
        onOpenChange={handleSymptomLogDialogOpenChange}
        onSubmit={handleSymptomLogSubmit}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Diario de sintomas</CardTitle>
            <CardDescription>
              Registro preparado para seguir evolucion diaria y cruzarlo mas adelante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {symptomSignals.map((signal) => (
                <div key={signal.key} className="rounded-lg border bg-muted p-4">
                  <Activity className="mb-3 size-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-medium">{signal.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ultimo:{" "}
                    {latestSymptomLog
                      ? `${latestSymptomLog[signal.key]}/10`
                      : "sin datos"}
                  </p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              disabled={!canOpenCreateDialog}
              title={canOpenCreateDialog ? "Registrar entrada" : disabledReason}
              onClick={handleOpenCreateSymptomLogDialog}
            >
              <ClipboardList aria-hidden="true" />
              Registrar entrada
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proxima fase</CardTitle>
            <CardDescription>
              Correlacion entre comidas, recetas y sintomas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
              <CalendarClock className="mb-3 size-5" aria-hidden="true" />
              CRUD de sintomas listo. La relacion con historial queda pendiente para una
              iteracion separada.
            </div>
          </CardContent>
        </Card>
      </div>

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
        <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Todavia no hay sintomas registrados.
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
