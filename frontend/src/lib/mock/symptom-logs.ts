import { symptomLogSchema, type SymptomLog } from "@/lib/types/symptom-log";

// Used only when NEXT_PUBLIC_API_BASE_URL is not configured.
export const symptomLogs: SymptomLog[] = symptomLogSchema.array().parse([
  {
    id: "symptom-log-001",
    loggedAt: "2026-06-10T11:30:00.000Z",
    bloating: 2,
    pain: 1,
    gas: 2,
    transit: 5,
    energy: 7,
    sleep: 6,
    notes: "Manana estable tras desayuno simple.",
    createdAt: "2026-06-10T11:35:00.000Z",
    updatedAt: "2026-06-10T11:35:00.000Z",
  },
  {
    id: "symptom-log-002",
    loggedAt: "2026-06-09T18:15:00.000Z",
    bloating: 3,
    pain: 2,
    gas: 3,
    transit: 5,
    energy: 6,
    sleep: 7,
    notes: "Sin empeoramiento claro despues del bowl.",
    createdAt: "2026-06-09T18:25:00.000Z",
    updatedAt: "2026-06-09T18:25:00.000Z",
  },
  {
    id: "symptom-log-003",
    loggedAt: "2026-06-08T23:00:00.000Z",
    bloating: 5,
    pain: 3,
    gas: 5,
    transit: 4,
    energy: 5,
    sleep: 5,
    notes: "Ligera hinchazon tras prueba de calabacin.",
    createdAt: "2026-06-08T23:05:00.000Z",
    updatedAt: "2026-06-08T23:05:00.000Z",
  },
]);
