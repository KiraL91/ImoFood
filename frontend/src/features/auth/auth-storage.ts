import type { AuthSession } from "@/lib/types/auth";

const authSessionKey = "imo-meals-auth-session";
export const authSessionExpiredEvent = "imo-meals-auth-session-expired";

type AccessTokenPayload = {
  exp?: unknown;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

  return window.atob(paddedBase64);
}

export function getAccessTokenExpiration(accessToken: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const [, encodedPayload] = accessToken.split(".");

    if (!encodedPayload) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AccessTokenPayload;

    if (typeof payload.exp !== "number") {
      return null;
    }

    return payload.exp;
  } catch {
    return null;
  }
}

function isAccessTokenExpired(accessToken: string): boolean {
  const expiration = getAccessTokenExpiration(accessToken);

  if (!expiration) {
    return true;
  }

  return expiration <= Math.floor(Date.now() / 1000);
}

export function expireStoredAuthSession(): void {
  clearStoredAuthSession();
  window.dispatchEvent(new Event(authSessionExpiredEvent));
}

export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(authSessionKey);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as AuthSession;

    if (isAccessTokenExpired(session.accessToken)) {
      expireStoredAuthSession();
      return null;
    }

    return session;
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
