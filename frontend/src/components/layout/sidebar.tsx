"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { isNavigationItemActive, navigationGroups } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/providers/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">IMO Meals</p>
          <h1 className="text-lg font-semibold leading-6">Plan diario</h1>
        </div>
      </div>
      <nav
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5"
        aria-label="Principal"
      >
        {navigationGroups.map((group) => (
          <section key={group.id} className="space-y-2">
            <div className="px-3">
              <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                {group.label}
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {group.description}
              </p>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isNavigationItemActive(pathname, item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-medium">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
      <div className="border-t px-6 py-5">
        {isAuthenticated && user ? (
          <div className="text-xs leading-5 text-muted-foreground">
            <p className="font-medium text-foreground">{user.username}</p>
            <p>Rol activo: {user.role}</p>
          </div>
        ) : (
          <p className="text-xs leading-5 text-muted-foreground">
            Inicia sesion para usar permisos contra el backend.
          </p>
        )}
      </div>
    </aside>
  );
}
