import { UserRole } from "@prisma/client";

export const PERMISSIONS_KEY = "permissions";

export const permissions = [
  "foods:read",
  "foods:create",
  "foods:update",
  "foods:delete",
  "recipes:read",
  "recipes:create",
  "recipes:update",
  "recipes:delete",
  "meal-logs:read",
  "meal-logs:create",
  "meal-logs:update",
  "meal-logs:delete",
  "symptom-logs:read",
  "symptom-logs:create",
  "symptom-logs:update",
  "symptom-logs:delete",
  "treatments:read",
  "treatments:create",
  "treatments:update",
  "treatments:delete",
  "treatment-logs:read",
  "treatment-logs:create",
  "treatment-logs:update",
  "treatment-logs:delete",
  "ai-suggestions:read",
  "ai-suggestions:create",
  "users:read",
  "users:create",
  "users:update",
  "users:disable",
  "users:enable",
  "users:reset-password",
] as const;

export type Permission = (typeof permissions)[number];

export type RoleCatalogItem = {
  description: string;
  label: string;
  permissions: Permission[];
  role: UserRole;
};

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.owner]: [
    "foods:read",
    "foods:create",
    "foods:update",
    "foods:delete",
    "recipes:read",
    "recipes:create",
    "recipes:update",
    "recipes:delete",
    "meal-logs:read",
    "meal-logs:create",
    "meal-logs:update",
    "meal-logs:delete",
    "symptom-logs:read",
    "symptom-logs:create",
    "symptom-logs:update",
    "symptom-logs:delete",
    "treatments:read",
    "treatments:create",
    "treatments:update",
    "treatments:delete",
    "treatment-logs:read",
    "treatment-logs:create",
    "treatment-logs:update",
    "treatment-logs:delete",
    "ai-suggestions:read",
    "ai-suggestions:create",
    "users:read",
    "users:create",
    "users:update",
    "users:disable",
    "users:enable",
    "users:reset-password",
  ],
  [UserRole.member]: [
    "foods:read",
    "foods:create",
    "foods:update",
    "recipes:read",
    "recipes:create",
    "recipes:update",
    "meal-logs:read",
    "meal-logs:create",
    "meal-logs:update",
    "symptom-logs:read",
    "symptom-logs:create",
    "symptom-logs:update",
    "treatments:read",
    "treatments:create",
    "treatments:update",
    "treatment-logs:read",
    "treatment-logs:create",
    "treatment-logs:update",
    "ai-suggestions:read",
    "ai-suggestions:create",
  ],
  [UserRole.readonly]: [
    "foods:read",
    "recipes:read",
    "meal-logs:read",
    "symptom-logs:read",
    "treatments:read",
    "treatment-logs:read",
    "ai-suggestions:read",
  ],
};

const roleCatalogOrder: UserRole[] = [
  UserRole.owner,
  UserRole.member,
  UserRole.readonly,
];

const roleMetadata: Record<
  UserRole,
  {
    description: string;
    label: string;
  }
> = {
  [UserRole.owner]: {
    description:
      "Acceso completo a datos, usuarios y acciones administrativas.",
    label: "Owner",
  },
  [UserRole.member]: {
    description:
      "Puede crear y editar datos personales sin administrar usuarios.",
    label: "Member",
  },
  [UserRole.readonly]: {
    description: "Puede consultar datos y sugerencias sin crear ni modificar.",
    label: "Readonly",
  },
};

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}

export function getRoleCatalog(): RoleCatalogItem[] {
  return roleCatalogOrder.map((role) => ({
    ...roleMetadata[role],
    permissions: [...rolePermissions[role]],
    role,
  }));
}
