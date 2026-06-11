import type { UserRole } from "@prisma/client";

import type { Permission } from "../auth.constants";

export type AuthenticatedUser = {
  displayName?: string;
  email?: string;
  id: string;
  permissions: Permission[];
  role: UserRole;
  username: string;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};
