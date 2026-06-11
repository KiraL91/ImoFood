import { UserRole } from "@prisma/client";

export const PERMISSIONS_KEY = "permissions";

export const permissions = [
  "foods:read",
  "foods:create",
  "foods:update",
  "foods:delete",
] as const;

export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.owner]: [
    "foods:read",
    "foods:create",
    "foods:update",
    "foods:delete",
  ],
  [UserRole.member]: ["foods:read", "foods:create", "foods:update"],
  [UserRole.readonly]: ["foods:read"],
};

export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role];
}
