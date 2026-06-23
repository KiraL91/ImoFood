export type UserRole = "owner" | "member" | "readonly";

export type Permission =
  | "foods:read"
  | "foods:create"
  | "foods:update"
  | "foods:delete"
  | "recipes:read"
  | "recipes:create"
  | "recipes:update"
  | "recipes:delete"
  | "meal-logs:read"
  | "meal-logs:create"
  | "meal-logs:update"
  | "meal-logs:delete"
  | "symptom-logs:read"
  | "symptom-logs:create"
  | "symptom-logs:update"
  | "symptom-logs:delete"
  | "treatments:read"
  | "treatments:create"
  | "treatments:update"
  | "treatments:delete"
  | "treatment-logs:read"
  | "treatment-logs:create"
  | "treatment-logs:update"
  | "treatment-logs:delete"
  | "ai-suggestions:read"
  | "ai-suggestions:create"
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:disable"
  | "users:enable"
  | "users:reset-password";

export type AuthUser = {
  displayName?: string;
  email?: string;
  id: string;
  permissions: Permission[];
  role: UserRole;
  username: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type RoleCatalogItem = {
  description: string;
  label: string;
  permissions: Permission[];
  role: UserRole;
};
