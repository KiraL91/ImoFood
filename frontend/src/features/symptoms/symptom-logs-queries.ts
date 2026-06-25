"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSymptomLog,
  deleteSymptomLog,
  getSymptomLogs,
  updateSymptomLog,
} from "@/features/symptoms/symptom-logs-api";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

export const symptomLogQueryKeys = {
  all: ["symptom-logs"] as const,
};

export function useSymptomLogs() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: Boolean(env.NEXT_PUBLIC_API_BASE_URL) && isAuthenticated,
    queryKey: symptomLogQueryKeys.all,
    queryFn: () => getSymptomLogs(),
  });
}

export function useCreateSymptomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSymptomLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: symptomLogQueryKeys.all });
    },
  });
}

export function useUpdateSymptomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSymptomLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: symptomLogQueryKeys.all });
    },
  });
}

export function useDeleteSymptomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSymptomLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: symptomLogQueryKeys.all });
    },
  });
}
