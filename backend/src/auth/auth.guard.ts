import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import type { AuthenticatedRequest } from "./types/authenticated-user";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = this.authService.verifyAccessToken(token);
    request.user = await this.authService.getAuthenticatedUser(payload.sub);

    return true;
  }
}
