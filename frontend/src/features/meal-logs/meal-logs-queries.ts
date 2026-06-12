"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMealLog,
  deleteMealLog,
  getMealLogs,
  updateMealLog,
} from "@/features/meal-logs/meal-logs-api";
import { env } from "@/lib/env";
import { mealLogs as mockMealLogs } from "@/lib/mock/meal-logs";
import { useAuth } from "@/providers/auth-provider";

export const mealLogQueryKeys = {
  all: ["meal-logs"] as const,
};

export function useMealLogs() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: !env.NEXT_PUBLIC_API_BASE_URL || isAuthenticated,
    queryKey: mealLogQueryKeys.all,
    queryFn: async () => {
      if (!env.NEXT_PUBLIC_API_BASE_URL) {
        return mockMealLogs;
      }

      return getMealLogs();
    },
  });
}

export function useCreateMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMealLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mealLogQueryKeys.all });
    },
  });
}

export function useUpdateMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMealLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mealLogQueryKeys.all });
    },
  });
}

export function useDeleteMealLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMealLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mealLogQueryKeys.all });
    },
  });
}
