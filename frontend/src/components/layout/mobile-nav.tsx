"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isNavigationItemActive,
  mobileNavigationItems,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const pathname = usePathname();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const openGroup = mobileNavigationItems.find(
    (item) => item.type === "group" && item.id === openGroupId,
  );

  useEffect(() => {
    setOpenGroupId(null);
  }, [pathname]);

  return (
    <>
      {openGroup?.type === "group" && (
        <>
          <button
            type="button"
            aria-label="Cerrar menu"
            className="fixed inset-0 z-30 bg-foreground/15 backdrop-blur-[1px] lg:hidden"
            onClick={() => setOpenGroupId(null)}
          />
          <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 rounded-lg border border-primary/20 bg-white p-3 text-popover-foreground shadow-[0_24px_60px_rgba(39,33,28,0.24)] ring-1 ring-foreground/10 lg:hidden">
            <div className="mb-3">
              <p className="text-sm font-semibold">{openGroup.label}</p>
            </div>
            <div className="grid gap-2">
              {openGroup.items.map((item) => {
                const isActive = isNavigationItemActive(pathname, item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur lg:hidden"
        aria-label="Principal movil"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1 py-2">
          {mobileNavigationItems.map((item) => {
            const isActive =
              item.type === "group"
                ? item.items.some((childItem) =>
                    isNavigationItemActive(pathname, childItem),
                  )
                : isNavigationItemActive(pathname, item);
            const Icon = item.icon;

            if (item.type === "group") {
              const isOpen = openGroupId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-expanded={isOpen}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-medium transition-colors sm:text-[11px]",
                    isOpen || isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() =>
                    setOpenGroupId((currentGroupId) =>
                      currentGroupId === item.id ? null : item.id,
                    )
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="max-w-full truncate">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-medium transition-colors sm:text-[11px]",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setOpenGroupId(null)}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
