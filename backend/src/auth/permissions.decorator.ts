import { SetMetadata } from "@nestjs/common";

import { PERMISSIONS_KEY, type Permission } from "./auth.constants";

export function Permissions(...permissions: Permission[]) {
  return SetMetadata(PERMISSIONS_KEY, permissions);
}
