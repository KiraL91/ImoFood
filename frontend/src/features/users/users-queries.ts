"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  disableUser,
  enableUser,
  getUsers,
  updateUser,
} from "@/features/users/users-api";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

export const userQueryKeys = {
  all: ["users"] as const,
};

export function useUsers() {
  const { hasPermission, isAuthenticated } = useAuth();

  return useQuery({
    enabled:
      Boolean(env.NEXT_PUBLIC_API_BASE_URL) &&
      isAuthenticated &&
      hasPermission("users:read"),
    queryKey: userQueryKeys.all,
    queryFn: getUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useDisableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useEnableUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}
