import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AppUser, UserRole } from "@prisma/client";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

import { getRolePermissions } from "./auth.constants";
import type { LoginDto } from "./dto/login.dto";
import type { AuthenticatedUser } from "./types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";

type AccessTokenPayload = {
  exp: number;
  iat: number;
  role: UserRole;
  sub: string;
  username: string;
};

type LoginResult = {
  accessToken: string;
  user: AuthenticatedUser;
};

const tokenTtlSeconds = 60 * 60 * 8;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const username = loginDto.username.trim().toLowerCase();
    const user = await this.prisma.appUser.findUnique({
      where: {
        username,
      },
    });

    if (!user || !this.verifyPassword(loginDto.password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid username or password.");
    }

    return this.createLoginResult(user);
  }

  async getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.appUser.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Authenticated user was not found.");
    }

    return this.toAuthenticatedUser(user);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split(".");

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException("Invalid access token.");
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException("Invalid access token.");
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AccessTokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException("Access token has expired.");
    }

    return payload;
  }

  private createLoginResult(user: AppUser): LoginResult {
    const authenticatedUser = this.toAuthenticatedUser(user);

    return {
      accessToken: this.createAccessToken(authenticatedUser),
      user: authenticatedUser,
    };
  }

  private createAccessToken(user: AuthenticatedUser): string {
    const iat = Math.floor(Date.now() / 1000);
    const payload: AccessTokenPayload = {
      exp: iat + tokenTtlSeconds,
      iat,
      role: user.role,
      sub: user.id,
      username: user.username,
    };
    const encodedHeader = this.encode({ alg: "HS256", typ: "JWT" });
    const encodedPayload = this.encode(payload);
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private encode(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private getJwtSecret(): string {
    if (process.env.JWT_SECRET) {
      return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be configured in production.");
    }

    return "imo-meals-local-dev-secret";
  }

  private sign(value: string): string {
    return createHmac("sha256", this.getJwtSecret())
      .update(value)
      .digest("base64url");
  }

  private verifyPassword(password: string, passwordHash: string): boolean {
    const [algorithm, salt, storedHash] = passwordHash.split(":");

    if (algorithm !== "scrypt" || !salt || !storedHash) {
      return false;
    }

    const candidateHash = scryptSync(password, salt, 64).toString("hex");
    const storedBuffer = Buffer.from(storedHash, "hex");
    const candidateBuffer = Buffer.from(candidateHash, "hex");

    return (
      storedBuffer.length === candidateBuffer.length &&
      timingSafeEqual(storedBuffer, candidateBuffer)
    );
  }

  private toAuthenticatedUser(user: AppUser): AuthenticatedUser {
    return {
      displayName: user.displayName ?? undefined,
      email: user.email ?? undefined,
      id: user.id,
      permissions: getRolePermissions(user.role),
      role: user.role,
      username: user.username,
    };
  }
}
