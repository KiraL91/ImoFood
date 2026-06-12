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
  ],
  [UserRole.member]: [
    "foods:read",
    "foods:create",
    "foods:update",
    "recipes:read",
    "recipes:create",
    "recipes:update",
  ],
  [UserRole.readonly]: ["foods:read", "recipes:read"],
};

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}
