"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTreatment,
  createTreatmentLog,
  deleteTreatment,
  deleteTreatmentLog,
  getTreatmentLogs,
  getTreatments,
  updateTreatment,
  updateTreatmentLog,
} from "@/features/treatments/treatments-api";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

export const treatmentQueryKeys = {
  all: ["treatments"] as const,
  logs: ["treatment-logs"] as const,
};

export function useTreatments() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: Boolean(env.NEXT_PUBLIC_API_BASE_URL) && isAuthenticated,
    queryKey: treatmentQueryKeys.all,
    queryFn: () => getTreatments(),
  });
}

export function useTreatmentLogs() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: Boolean(env.NEXT_PUBLIC_API_BASE_URL) && isAuthenticated,
    queryKey: treatmentQueryKeys.logs,
    queryFn: () => getTreatmentLogs(),
  });
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTreatment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.all });
    },
  });
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTreatment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.all });
    },
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTreatment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.logs });
    },
  });
}

export function useCreateTreatmentLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTreatmentLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.logs });
    },
  });
}

export function useUpdateTreatmentLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTreatmentLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.logs });
    },
  });
}

export function useDeleteTreatmentLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTreatmentLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: treatmentQueryKeys.logs });
    },
  });
}
