"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  generateAiMealIdeas,
  getAiSuggestionsConfig,
} from "@/features/meal-ideas/ai-meal-ideas-api";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

export const aiMealIdeasQueryKeys = {
  config: ["ai-meal-ideas", "config"] as const,
};

export function useAiSuggestionsConfig() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    enabled: Boolean(env.NEXT_PUBLIC_API_BASE_URL) && isAuthenticated,
    queryFn: getAiSuggestionsConfig,
    queryKey: aiMealIdeasQueryKeys.config,
  });
}

export function useGenerateAiMealIdeas() {
  return useMutation({
    mutationFn: generateAiMealIdeas,
  });
}
