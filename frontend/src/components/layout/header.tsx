"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNavigationItem } from "@/lib/constants/navigation";
import { useAuth } from "@/providers/auth-provider";

export function Header() {
  const pathname = usePathname();
  const currentItem = getNavigationItem(pathname);
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">IMO Meals</p>
          <h2 className="truncate text-xl font-semibold leading-7 sm:text-2xl">
            {currentItem.label}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Sparkles aria-hidden="true" />
            IA futura
          </Button>
          {isAuthenticated && user ? (
            <>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.role}
              </Badge>
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                <LogOut aria-hidden="true" />
                Salir
              </Button>
            </>
          ) : (
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">
                <LogIn aria-hidden="true" />
                Entrar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
