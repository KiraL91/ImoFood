import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  CookingPot,
  History,
  LayoutDashboard,
  Lightbulb,
  Pill,
  Settings,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Dashboard",
    description: "Resumen de alimentos, recetas y sugerencias",
    icon: LayoutDashboard,
  },
  {
    href: "/foods",
    label: "Alimentos",
    description: "Estados y tolerancias personales",
    icon: Apple,
  },
  {
    href: "/recipes",
    label: "Recetas",
    description: "Preparaciones compatibles con tu fase",
    icon: CookingPot,
  },
  {
    href: "/meal-ideas",
    label: "Ideas",
    description: "Combinaciones rápidas para decidir comida",
    icon: Lightbulb,
  },
  {
    href: "/meal-logs",
    label: "Historial",
    description: "Comidas registradas para correlacionar con síntomas.",
    icon: History,
  },
  {
    href: "/treatments",
    label: "Tratamientos",
    description: "Seguimiento de medicacion y tratamientos relacionados",
    icon: Pill,
  },
  {
    href: "/symptoms",
    label: "Síntomas",
    description: "Registro clínico para una fase posterior",
    icon: Activity,
  },
  {
    href: "/settings",
    label: "Ajustes",
    description: "Preferencias y estado de integración",
    icon: Settings,
  },
];

export function getNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    ) ?? navigationItems[0]
  );
}
