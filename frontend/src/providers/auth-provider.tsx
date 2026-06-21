"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authSessionExpiredEvent,
  clearStoredAuthSession,
  expireStoredAuthSession,
  getAccessTokenExpiration,
  getStoredAuthSession,
  storeAuthSession,
} from "@/features/auth/auth-storage";
import { login as loginRequest, type LoginInput } from "@/features/auth/auth-api";
import type { AuthSession, AuthUser, Permission } from "@/lib/types/auth";

type AuthContextValue = {
  hasPermission: (permission: Permission) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  session: AuthSession | null;
  updateUser: (user: AuthUser) => void;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleAuthSessionExpired() {
      clearStoredAuthSession();
      setSession(null);
    }

    window.addEventListener(authSessionExpiredEvent, handleAuthSessionExpired);
    setSession(getStoredAuthSession());
    setIsLoading(false);

    return () => {
      window.removeEventListener(authSessionExpiredEvent, handleAuthSessionExpired);
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const expiration = getAccessTokenExpiration(session.accessToken);

    if (!expiration) {
      expireStoredAuthSession();
      return;
    }

    const delay = expiration * 1000 - Date.now();

    if (delay <= 0) {
      expireStoredAuthSession();
      return;
    }

    const timeoutId = window.setTimeout(expireStoredAuthSession, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      hasPermission: (permission) =>
        session?.user.permissions.includes(permission) ?? false,
      isAuthenticated: Boolean(session),
      isLoading,
      login: async (input) => {
        const nextSession = await loginRequest(input);
        storeAuthSession(nextSession);
        setSession(nextSession);
      },
      logout: () => {
        clearStoredAuthSession();
        setSession(null);
      },
      session,
      updateUser: (user) => {
        setSession((currentSession) => {
          if (!currentSession) {
            return currentSession;
          }

          const nextSession = {
            ...currentSession,
            user,
          };

          storeAuthSession(nextSession);

          return nextSession;
        });
      },
      user: session?.user ?? null,
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
