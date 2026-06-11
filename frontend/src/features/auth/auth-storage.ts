import type { AuthSession } from "@/lib/types/auth";

const authSessionKey = "imo-meals-auth-session";

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(authSessionKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(authSessionKey);
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  return getStoredAuthSession()?.accessToken ?? null;
}

export function storeAuthSession(session: AuthSession): void {
  window.localStorage.setItem(authSessionKey, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  window.localStorage.removeItem(authSessionKey);
}
