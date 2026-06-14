import { apiClient } from "@/lib/api/client";
import { symptomLogSchema, type SymptomLog } from "@/lib/types/symptom-log";

export type CreateSymptomLogInput = {
  loggedAt: string;
  bloating: number;
  pain: number;
  gas: number;
  transit: number;
  energy: number;
  sleep: number;
  notes?: string | null;
  mealLogId?: string | null;
};

export type UpdateSymptomLogInput = Partial<CreateSymptomLogInput>;

export async function getSymptomLogs(): Promise<SymptomLog[]> {
  const data = await apiClient<unknown>("/symptom-logs");

  return symptomLogSchema.array().parse(data);
}

export async function createSymptomLog(
  input: CreateSymptomLogInput,
): Promise<SymptomLog> {
  const data = await apiClient<unknown>("/symptom-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return symptomLogSchema.parse(data);
}

export async function updateSymptomLog({
  id,
  input,
}: {
  id: string;
  input: UpdateSymptomLogInput;
}): Promise<SymptomLog> {
  const data = await apiClient<unknown>(`/symptom-logs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return symptomLogSchema.parse(data);
}

export async function deleteSymptomLog(id: string): Promise<void> {
  await apiClient<void>(`/symptom-logs/${id}`, {
    method: "DELETE",
  });
}
