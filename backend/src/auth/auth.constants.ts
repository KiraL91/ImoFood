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
] as const;

export type Permission = (typeof permissions)[number];

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
  ],
  [UserRole.readonly]: [
    "foods:read",
    "recipes:read",
    "meal-logs:read",
    "symptom-logs:read",
    "treatments:read",
    "treatment-logs:read",
  ],
};

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}
