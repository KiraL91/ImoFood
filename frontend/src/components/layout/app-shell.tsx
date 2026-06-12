"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/providers/auth-provider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isLoginPath = pathname === "/login";

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !isLoginPath) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isLoginPath) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, isLoginPath, router]);

  if (
    isLoading ||
    (!isAuthenticated && !isLoginPath) ||
    (isAuthenticated && isLoginPath)
  ) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
        <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          Preparando sesion...
        </div>
      </div>
    );
  }

  if (isLoginPath) {
    return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-72">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 pb-40 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
