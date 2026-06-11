export type UserRole = "owner" | "member" | "readonly";

export type Permission = "foods:read" | "foods:create" | "foods:update" | "foods:delete";

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
