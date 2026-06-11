import { apiClient } from "@/lib/api/client";
import type { AuthSession, AuthUser } from "@/lib/types/auth";

export type LoginInput = {
  password: string;
  username: string;
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
