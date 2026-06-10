import { userPreferenceSchema, type UserPreference } from "@/lib/types/user-preference";

// Backend later: user preferences will map to GET /preferences and PATCH /preferences.
export const preferences: UserPreference[] = userPreferenceSchema.array().parse([
  {
    id: "pref-001",
    key: "safeMode",
    value: true,
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "pref-002",
    key: "preferredTags",
    value: ["base", "rapido", "sin gluten", "proteina"],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-08T10:00:00.000Z",
  },
  {
    id: "pref-003",
    key: "avoidedTags",
    value: ["fodmap", "lacteo", "porcion controlada"],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-09T10:00:00.000Z",
  },
  {
    id: "pref-004",
    key: "usualMealTypes",
    value: ["desayuno salado", "comida segura", "cena ligera"],
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-10T09:10:00.000Z",
  },
  {
    id: "pref-005",
    key: "aiEnabled",
    value: false,
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-10T09:10:00.000Z",
  },
  {
    id: "pref-006",
    key: "backendIntegration",
    value: "mock-only",
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-10T09:10:00.000Z",
  },
]);
