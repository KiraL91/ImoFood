export type UserRole = "owner" | "member" | "readonly";

export type Permission =
  | "foods:read"
  | "foods:create"
  | "foods:update"
  | "foods:delete"
  | "recipes:read"
  | "recipes:create"
  | "recipes:update"
  | "recipes:delete";

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
