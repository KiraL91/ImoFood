import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { PERMISSIONS_KEY, type Permission } from "./auth.constants";
import type { AuthenticatedRequest } from "./types/authenticated-user";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions = request.user?.permissions ?? [];
    const hasEveryPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasEveryPermission) {
      throw new ForbiddenException("Missing required permission.");
    }

    return true;
  }
}
