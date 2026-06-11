"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFood, deleteFood, getFoods, updateFood } from "@/features/foods/foods-api";
import { env } from "@/lib/env";
import { foods as mockFoods } from "@/lib/mock/foods";

export const foodQueryKeys = {
  all: ["foods"] as const,
};

export function useFoods() {
  return useQuery({
    queryKey: foodQueryKeys.all,
    queryFn: async () => {
      if (!env.NEXT_PUBLIC_API_BASE_URL) {
        return mockFoods;
      }

      return getFoods();
    },
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
