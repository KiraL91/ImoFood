"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFood,
  deleteFood,
  getFoods,
  suggestFoodInfo,
  updateFood,
} from "@/features/foods/foods-api";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

export const foodQueryKeys = {
  all: ["foods"] as const,
};

export function useFoods() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: Boolean(env.NEXT_PUBLIC_API_BASE_URL) && isAuthenticated,
    queryKey: foodQueryKeys.all,
    queryFn: () => getFoods(),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: foodQueryKeys.all });
    },
  });
}

export function useUpdateFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: foodQueryKeys.all });
    },
  });
}

export function useDeleteFood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFood,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: foodQueryKeys.all });
    },
  });
}

export function useSuggestFoodInfo() {
  return useMutation({
    mutationFn: suggestFoodInfo,
  });
}
