import { apiClient } from "@/lib/api/client";
import type { AuthSession, AuthUser } from "@/lib/types/auth";

export type LoginInput = {
  password: string;
  username: string;
};

export type UpdateCurrentUserInput = {
  displayName?: string;
  email?: string;
};

export type ChangeCurrentUserPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function login(input: LoginInput): Promise<AuthSession> {
  return apiClient<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiClient<AuthUser>("/auth/me");
}

export function updateCurrentUser(input: UpdateCurrentUserInput): Promise<AuthUser> {
  return apiClient<AuthUser>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function changeCurrentUserPassword(
  input: ChangeCurrentUserPasswordInput,
): Promise<void> {
  return apiClient<void>("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
