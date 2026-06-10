import type { FoodStatus } from "@/lib/types/food";

export const foodStatusMeta: Record<
  FoodStatus,
  {
    label: string;
    badgeClassName: string;
    dotClassName: string;
    panelClassName: string;
  }
> = {
  allowed: {
    label: "Permitido",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
    panelClassName: "bg-emerald-50 text-emerald-900",
  },
  caution: {
    label: "Dudoso",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
    panelClassName: "bg-amber-50 text-amber-900",
  },
  avoid: {
    label: "Prohibido",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-800",
    dotClassName: "bg-rose-500",
    panelClassName: "bg-rose-50 text-rose-900",
  },
  testing: {
    label: "En prueba",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-800",
    dotClassName: "bg-sky-500",
    panelClassName: "bg-sky-50 text-sky-900",
  },
};

export const foodStatusOrder: FoodStatus[] = ["allowed", "testing", "caution", "avoid"];
