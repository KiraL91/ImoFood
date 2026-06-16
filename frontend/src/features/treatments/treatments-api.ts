import { apiClient } from "@/lib/api/client";
import {
  treatmentLogSchema,
  treatmentSchema,
  type Treatment,
  type TreatmentCategory,
  type TreatmentLog,
  type TreatmentLogTiming,
  type TreatmentStatus,
  type TreatmentTarget,
} from "@/lib/types/treatment";

export type TreatmentFilters = {
  category?: TreatmentCategory;
  search?: string;
  status?: TreatmentStatus;
  target?: TreatmentTarget;
};

export type CreateTreatmentInput = {
  name: string;
  category: TreatmentCategory;
  targets: TreatmentTarget[];
  status: TreatmentStatus;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

export type UpdateTreatmentInput = Partial<CreateTreatmentInput>;

export type TreatmentLogFilters = {
  relatedMealLogId?: string;
  relatedSymptomLogId?: string;
  treatmentId?: string;
};

export type CreateTreatmentLogInput = {
  treatmentId: string;
  takenAt: string;
  dose?: string;
  timing?: TreatmentLogTiming;
  relatedMealLogId?: string;
  relatedSymptomLogId?: string;
  notes?: string;
};

export type UpdateTreatmentLogInput = Partial<CreateTreatmentLogInput>;

function buildSearchParams(filters: Record<string, string | undefined> = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getTreatments(filters?: TreatmentFilters): Promise<Treatment[]> {
  const data = await apiClient<unknown>(`/treatments${buildSearchParams(filters)}`);

  return treatmentSchema.array().parse(data);
}

export async function createTreatment(input: CreateTreatmentInput): Promise<Treatment> {
  const data = await apiClient<unknown>("/treatments", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return treatmentSchema.parse(data);
}

export async function updateTreatment({
  id,
  input,
}: {
  id: string;
  input: UpdateTreatmentInput;
}): Promise<Treatment> {
  const data = await apiClient<unknown>(`/treatments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return treatmentSchema.parse(data);
}

export async function deleteTreatment(id: string): Promise<void> {
  await apiClient<void>(`/treatments/${id}`, {
    method: "DELETE",
  });
}

export async function getTreatmentLogs(
  filters?: TreatmentLogFilters,
): Promise<TreatmentLog[]> {
  const data = await apiClient<unknown>(`/treatment-logs${buildSearchParams(filters)}`);

  return treatmentLogSchema.array().parse(data);
}

export async function createTreatmentLog(
  input: CreateTreatmentLogInput,
): Promise<TreatmentLog> {
  const data = await apiClient<unknown>("/treatment-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return treatmentLogSchema.parse(data);
}

export async function updateTreatmentLog({
  id,
  input,
}: {
  id: string;
  input: UpdateTreatmentLogInput;
}): Promise<TreatmentLog> {
  const data = await apiClient<unknown>(`/treatment-logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return treatmentLogSchema.parse(data);
}

export async function deleteTreatmentLog(id: string): Promise<void> {
  await apiClient<void>(`/treatment-logs/${id}`, {
    method: "DELETE",
  });
}
