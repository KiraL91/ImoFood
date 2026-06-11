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
  clearStoredAuthSession,
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
    setSession(getStoredAuthSession());
    setIsLoading(false);
  }, []);

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
