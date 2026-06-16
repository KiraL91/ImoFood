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

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
};

export type MobileNavigationItem =
  | (NavigationItem & {
      type: "link";
    })
  | {
      type: "group";
      id: string;
      label: string;
      icon: LucideIcon;
      items: NavigationItem[];
    };

const todayItem: NavigationItem = {
  href: "/",
  label: "Hoy",
  description: "Resumen rapido y accesos principales",
  icon: LayoutDashboard,
};

const foodsItem: NavigationItem = {
  href: "/foods",
  label: "Alimentos",
  description: "Estados y tolerancias personales",
  icon: Apple,
};

const recipesItem: NavigationItem = {
  href: "/recipes",
  label: "Recetas",
  description: "Preparaciones compatibles con tu fase",
  icon: CookingPot,
};

const mealIdeasItem: NavigationItem = {
  href: "/meal-ideas",
  label: "Ideas",
  description: "Combinaciones rapidas para decidir comida",
  icon: Lightbulb,
};

const mealLogsItem: NavigationItem = {
  href: "/meal-logs",
  label: "Mi diario",
  description: "Ingestas registradas y sintomas posteriores",
  icon: History,
};

const treatmentsItem: NavigationItem = {
  href: "/treatments",
  label: "Tratamientos",
  description: "Seguimiento de medicacion y tratamientos relacionados",
  icon: Pill,
};

const symptomsItem: NavigationItem = {
  href: "/symptoms",
  label: "Sintomas",
  description: "Diario posterior asociado a ingestas",
  icon: Activity,
};

const settingsItem: NavigationItem = {
  href: "/settings",
  label: "Ajustes",
  description: "Preferencias y estado de integracion",
  icon: Settings,
};

export const navigationItems: NavigationItem[] = [
  todayItem,
  foodsItem,
  recipesItem,
  mealIdeasItem,
  mealLogsItem,
  treatmentsItem,
  symptomsItem,
  settingsItem,
];

export const navigationGroups: NavigationGroup[] = [
  {
    id: "tracking",
    label: "Seguimiento",
    items: [todayItem, mealLogsItem, symptomsItem],
  },
  {
    id: "food",
    label: "Comida",
    items: [foodsItem, recipesItem, mealIdeasItem],
  },
  {
    id: "support",
    label: "Soporte",
    items: [treatmentsItem],
  },
  {
    id: "system",
    label: "Sistema",
    items: [settingsItem],
  },
];

export const mobileNavigationItems: MobileNavigationItem[] = [
  {
    ...todayItem,
    type: "link",
  },
  {
    id: "diary",
    type: "group",
    label: "Mi diario",
    icon: History,
    items: [mealLogsItem, symptomsItem],
  },
  {
    id: "library",
    type: "group",
    label: "Biblioteca",
    icon: CookingPot,
    items: [foodsItem, recipesItem, mealIdeasItem],
  },
  {
    ...treatmentsItem,
    type: "link",
    label: "Tratamiento",
  },
  {
    ...settingsItem,
    type: "link",
    label: "Mas",
    description: "Ajustes y preferencias",
  },
];

export function isNavigationItemActive(pathname: string, item: NavigationItem) {
  return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
}

export function getNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) => isNavigationItemActive(pathname, item)) ??
    navigationItems[0]
  );
}
