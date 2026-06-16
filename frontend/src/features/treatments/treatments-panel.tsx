"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Server, Stethoscope } from "lucide-react";
import { TreatmentCard } from "@/components/treatments/treatment-card";
import { TreatmentFormDialog } from "@/components/treatments/treatment-form-dialog";
import { TreatmentLogFormDialog } from "@/components/treatments/treatment-log-form-dialog";
import { TreatmentLogCard } from "@/components/treatments/treatment-log-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMealLogs } from "@/features/meal-logs/meal-logs-queries";
import { useSymptomLogs } from "@/features/symptoms/symptom-logs-queries";
import type {
  CreateTreatmentInput,
  CreateTreatmentLogInput,
} from "@/features/treatments/treatments-api";
import {
  useCreateTreatment,
  useCreateTreatmentLog,
  useDeleteTreatment,
  useTreatmentLogs,
  useTreatments,
  useUpdateTreatment,
} from "@/features/treatments/treatments-queries";
import { env } from "@/lib/env";
import type { Treatment } from "@/lib/types/treatment";
import { useAuth } from "@/providers/auth-provider";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se ha podido completar la operacion.";
}

export function TreatmentsPanel() {
  const [query, setQuery] = useState("");
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | undefined>();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const { hasPermission, isAuthenticated } = useAuth();
  const canCreateTreatment = hasPermission("treatments:create");
  const canUpdateTreatment = hasPermission("treatments:update");
  const canDeleteTreatment = hasPermission("treatments:delete");
  const canCreateTreatmentLog = hasPermission("treatment-logs:create");
  const treatmentsQuery = useTreatments();
  const treatmentLogsQuery = useTreatmentLogs();
  const mealLogsQuery = useMealLogs();
  const symptomLogsQuery = useSymptomLogs();
  const createTreatmentMutation = useCreateTreatment();
  const updateTreatmentMutation = useUpdateTreatment();
  const deleteTreatmentMutation = useDeleteTreatment();
  const createTreatmentLogMutation = useCreateTreatmentLog();
  const treatments = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (treatmentsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, treatmentsQuery.data],
  );
  const treatmentLogs = useMemo(
    () =>
      hasBackendConfigured && !isAuthenticated ? [] : (treatmentLogsQuery.data ?? []),
    [hasBackendConfigured, isAuthenticated, treatmentLogsQuery.data],
  );
  const mealLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (mealLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, mealLogsQuery.data],
  );
  const symptomLogs = useMemo(
    () => (hasBackendConfigured && !isAuthenticated ? [] : (symptomLogsQuery.data ?? [])),
    [hasBackendConfigured, isAuthenticated, symptomLogsQuery.data],
  );
  const isTreatmentSubmitting =
    createTreatmentMutation.isPending || updateTreatmentMutation.isPending;
  const isTreatmentFormDisabled =
    !hasBackendConfigured ||
    !isAuthenticated ||
    (editingTreatment ? !canUpdateTreatment : !canCreateTreatment);
  const canOpenCreateTreatmentDialog =
    hasBackendConfigured && isAuthenticated && canCreateTreatment;
  const canOpenLogDialog =
    hasBackendConfigured &&
    isAuthenticated &&
    canCreateTreatmentLog &&
    treatments.length > 0;
  const treatmentDisabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para usar el CRUD real de tratamientos."
      : editingTreatment
        ? "Tu rol no permite editar tratamientos."
        : "Tu rol no permite crear tratamientos.";
  const logDisabledReason = !hasBackendConfigured
    ? "Configura NEXT_PUBLIC_API_BASE_URL para guardar tomas contra el backend."
    : !isAuthenticated
      ? "Inicia sesion para registrar tomas."
      : treatments.length === 0
        ? "Crea primero un tratamiento para poder registrar tomas."
        : "Tu rol no permite registrar tomas.";

  const treatmentNameById = useMemo(
    () => new Map(treatments.map((treatment) => [treatment.id, treatment.name])),
    [treatments],
  );
  const mealDescriptionById = useMemo(
    () => new Map(mealLogs.map((mealLog) => [mealLog.id, mealLog.description])),
    [mealLogs],
  );
  const symptomDateById = useMemo(
    () => new Map(symptomLogs.map((symptomLog) => [symptomLog.id, symptomLog.loggedAt])),
    [symptomLogs],
  );
  const activeTreatments = treatments.filter(
    (treatment) => treatment.status === "active",
  );
  const completedTreatments = treatments.filter(
    (treatment) => treatment.status === "completed",
  );
  const filteredTreatments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return treatments;
    }

    return treatments.filter((treatment) =>
      [
        treatment.name,
        treatment.category,
        treatment.status,
        treatment.notes,
        ...treatment.targets,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, treatments]);

  async function handleTreatmentSubmit(input: CreateTreatmentInput) {
    setMutationError(null);

    try {
      if (editingTreatment) {
        await updateTreatmentMutation.mutateAsync({
          id: editingTreatment.id,
          input,
        });
        setEditingTreatment(undefined);
        setIsTreatmentDialogOpen(false);
        return;
      }

      await createTreatmentMutation.mutateAsync(input);
      setIsTreatmentDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  async function handleTreatmentLogSubmit(input: CreateTreatmentLogInput) {
    setMutationError(null);

    try {
      await createTreatmentLogMutation.mutateAsync(input);
      setIsLogDialogOpen(false);
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  function handleOpenCreateTreatmentDialog() {
    setMutationError(null);
    setEditingTreatment(undefined);
    setIsTreatmentDialogOpen(true);
  }

  function handleOpenEditTreatmentDialog(treatment: Treatment) {
    setMutationError(null);
    setEditingTreatment(treatment);
    setIsTreatmentDialogOpen(true);
  }

  function handleTreatmentDialogOpenChange(open: boolean) {
    setIsTreatmentDialogOpen(open);

    if (!open) {
      setEditingTreatment(undefined);
      setMutationError(null);
    }
  }

  function handleLogDialogOpenChange(open: boolean) {
    setIsLogDialogOpen(open);

    if (!open) {
      setMutationError(null);
    }
  }

  async function handleDeleteTreatment(treatment: Treatment) {
    const confirmed = window.confirm(`Borrar "${treatment.name}" del seguimiento?`);

    if (!confirmed) {
      return;
    }

    setMutationError(null);

    try {
      await deleteTreatmentMutation.mutateAsync(treatment.id);

      if (editingTreatment?.id === treatment.id) {
        setEditingTreatment(undefined);
        setIsTreatmentDialogOpen(false);
      }
    } catch (error) {
      setMutationError(getErrorMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <TreatmentFormDialog
        disabledReason={treatmentDisabledReason}
        errorMessage={mutationError}
        initialTreatment={editingTreatment}
        isDisabled={isTreatmentFormDisabled}
        isOpen={isTreatmentDialogOpen}
        isSubmitting={isTreatmentSubmitting}
        mode={editingTreatment ? "edit" : "create"}
        onCancel={() => {
          setEditingTreatment(undefined);
          setMutationError(null);
        }}
        onOpenChange={handleTreatmentDialogOpenChange}
        onSubmit={handleTreatmentSubmit}
      />

      <TreatmentLogFormDialog
        disabledReason={logDisabledReason}
        errorMessage={mutationError}
        isDisabled={!canOpenLogDialog}
        isOpen={isLogDialogOpen}
        isSubmitting={createTreatmentLogMutation.isPending}
        mealLogs={mealLogs}
        onCancel={() => setMutationError(null)}
        onOpenChange={handleLogDialogOpenChange}
        onSubmit={handleTreatmentLogSubmit}
        symptomLogs={symptomLogs}
        treatments={treatments}
      />

      {!hasBackendConfigured && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Mostrando datos mock. Para usar el CRUD real, levanta el backend y define
            NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 en frontend/.env.local.
          </p>
        </div>
      )}

      {hasBackendConfigured && !isAuthenticated && (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Server className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Inicia sesion en /login para consultar y modificar tratamientos desde el
            backend.
          </p>
        </div>
      )}

      {mutationError && !isTreatmentDialogOpen && !isLogDialogOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      {(treatmentsQuery.isError || treatmentLogsQuery.isError) && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getErrorMessage(treatmentsQuery.error ?? treatmentLogsQuery.error)}
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tratamientos</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Seguimiento de medicacion y tratamientos relacionados.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={!canOpenLogDialog}
            title={canOpenLogDialog ? "Registrar toma" : logDisabledReason}
            onClick={() => setIsLogDialogOpen(true)}
          >
            <Plus aria-hidden="true" />
            Registrar toma
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canOpenCreateTreatmentDialog}
            title={
              canOpenCreateTreatmentDialog
                ? "Anadir tratamiento"
                : treatmentDisabledReason
            }
            onClick={handleOpenCreateTreatmentDialog}
          >
            <Stethoscope aria-hidden="true" />
            Anadir tratamiento
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{activeTreatments.length}</CardTitle>
            <CardDescription>Tratamientos activos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{treatmentLogs.length}</CardTitle>
            <CardDescription>Tomas registradas</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{completedTreatments.length}</CardTitle>
            <CardDescription>Finalizados</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <h3 className="text-lg font-semibold">Tratamientos registrados</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Diario de seguimiento, no recomendador medico.
            </p>
          </div>
          <label className="relative block xl:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tratamiento u objetivo"
              className="pl-9"
              aria-label="Buscar tratamientos"
            />
          </label>
        </div>

        {treatmentsQuery.isLoading && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando tratamientos...
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              canDelete={hasBackendConfigured && isAuthenticated && canDeleteTreatment}
              canEdit={hasBackendConfigured && isAuthenticated && canUpdateTreatment}
              isDeleting={
                deleteTreatmentMutation.isPending &&
                deleteTreatmentMutation.variables === treatment.id
              }
              treatment={treatment}
              onDelete={handleDeleteTreatment}
              onEdit={handleOpenEditTreatmentDialog}
            />
          ))}
        </div>

        {!treatmentsQuery.isLoading && filteredTreatments.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No hay tratamientos que coincidan con el filtro actual.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Tomas recientes</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Registro cronologico para cruzar con comidas y sintomas.
          </p>
        </div>

        {treatmentLogsQuery.isLoading && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando tomas...
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {treatmentLogs.map((treatmentLog) => (
            <TreatmentLogCard
              key={treatmentLog.id}
              treatmentLog={treatmentLog}
              treatmentName={treatmentNameById.get(treatmentLog.treatmentId)}
              relatedMealDescription={
                treatmentLog.relatedMealLogId
                  ? mealDescriptionById.get(treatmentLog.relatedMealLogId)
                  : undefined
              }
              relatedSymptomDate={
                treatmentLog.relatedSymptomLogId
                  ? symptomDateById.get(treatmentLog.relatedSymptomLogId)
                  : undefined
              }
            />
          ))}
        </div>

        {!treatmentLogsQuery.isLoading && treatmentLogs.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            Todavia no hay tomas registradas.
          </div>
        )}
      </section>

      <Button
        type="button"
        size="icon"
        className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-40 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        disabled={!canOpenCreateTreatmentDialog}
        title={
          canOpenCreateTreatmentDialog ? "Anadir tratamiento" : treatmentDisabledReason
        }
        aria-label="Anadir tratamiento"
        onClick={handleOpenCreateTreatmentDialog}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
