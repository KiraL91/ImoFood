import { treatmentLogSchema, type TreatmentLog } from "@/lib/types/treatment";

// Backend later: replace with GET /treatment-logs and POST /treatment-logs.
export const treatmentLogs: TreatmentLog[] = treatmentLogSchema.array().parse([
  {
    id: "treatment-log-001",
    treatmentId: "treatment-002",
    takenAt: "2026-06-09T21:45:00.000Z",
    dose: "Segun pauta",
    timing: "night",
    relatedMealLogId: "meal-log-002",
    notes: "Sin molestias nocturnas destacables.",
    createdAt: "2026-06-09T21:50:00.000Z",
    updatedAt: "2026-06-09T21:50:00.000Z",
  },
  {
    id: "treatment-log-002",
    treatmentId: "treatment-004",
    takenAt: "2026-06-10T08:00:00.000Z",
    dose: "Dosis habitual",
    timing: "with-meal",
    relatedMealLogId: "meal-log-001",
    notes: "Registro de mantenimiento.",
    createdAt: "2026-06-10T08:05:00.000Z",
    updatedAt: "2026-06-10T08:05:00.000Z",
  },
  {
    id: "treatment-log-003",
    treatmentId: "treatment-001",
    takenAt: "2026-06-02T20:30:00.000Z",
    dose: "Ultima toma del curso",
    timing: "after-meal",
    relatedSymptomLogId: "symptom-log-002",
    notes: "Curso finalizado y marcado como completado.",
    createdAt: "2026-06-02T20:35:00.000Z",
    updatedAt: "2026-06-02T20:35:00.000Z",
  },
]);
