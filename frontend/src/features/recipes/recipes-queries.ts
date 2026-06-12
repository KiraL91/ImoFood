"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRecipe,
  deleteRecipe,
  getRecipes,
  updateRecipe,
} from "@/features/recipes/recipes-api";
import { env } from "@/lib/env";
import { recipes as mockRecipes } from "@/lib/mock/recipes";
import { useAuth } from "@/providers/auth-provider";

export const recipeQueryKeys = {
  all: ["recipes"] as const,
};

export function useRecipes() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: !env.NEXT_PUBLIC_API_BASE_URL || isAuthenticated,
    queryKey: recipeQueryKeys.all,
    queryFn: async () => {
      if (!env.NEXT_PUBLIC_API_BASE_URL) {
        return mockRecipes;
      }

      return getRecipes();
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recipeQueryKeys.all });
    },
  });
}
