import type { UserRole } from "@prisma/client";

export type User = {
  active: boolean;
  createdAt: string;
  displayName?: string;
  email?: string;
  id: string;
  lastDisabledAt?: string;
  lastDisabledByUserId?: string;
  lastEnabledAt?: string;
  lastEnabledByUserId?: string;
  passwordResetAt?: string;
  passwordResetByUserId?: string;
  role: UserRole;
  updatedAt: string;
  username: string;
};
