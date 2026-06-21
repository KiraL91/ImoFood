import type { UserRole } from "@prisma/client";

export type User = {
  active: boolean;
  createdAt: string;
  displayName?: string;
  email?: string;
  id: string;
  role: UserRole;
  updatedAt: string;
  username: string;
};
