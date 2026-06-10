"use client";

import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNavigationItem } from "@/lib/constants/navigation";

export function Header() {
  const pathname = usePathname();
  const currentItem = getNavigationItem(pathname);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-muted-foreground">IMO Meals</p>
          <h2 className="truncate text-xl font-semibold leading-7 sm:text-2xl">
            {currentItem.label}
          </h2>
        </div>
        <Button variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex">
          <Sparkles aria-hidden="true" />
          IA futura
        </Button>
      </div>
    </header>
  );
}
