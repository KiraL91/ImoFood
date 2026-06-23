import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import assert from "node:assert/strict";
import test from "node:test";

import { getRolePermissions, type Permission } from "../auth/auth.constants";
import { AuthService } from "../auth/auth.service";
import { PermissionsGuard } from "../auth/permissions.guard";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";

type PublicUserRecord = {
  active: boolean;
  createdAt: Date;
  displayName: string | null;
  email: string | null;
  id: string;
  role: UserRole;
  updatedAt: Date;
  username: string;
};

function createPublicUser(
  overrides: Partial<PublicUserRecord> = {},
): PublicUserRecord {
  return {
    active: true,
    createdAt: new Date("2026-06-23T10:00:00.000Z"),
    displayName: "Member",
    email: "member@imo-meals.local",
    id: "member-id",
    role: UserRole.member,
    updatedAt: new Date("2026-06-23T11:00:00.000Z"),
    username: "member",
    ...overrides,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);

  return value as Record<string, unknown>;
}

function createAuthService(prisma: unknown): AuthService {
  return new AuthService(prisma as PrismaService);
}

function createUsersService(
  authService: AuthService,
  prisma: unknown,
): UsersService {
  return new UsersService(authService, prisma as PrismaService);
}

test("user admin permissions are assigned only to owner", () => {
  const userPermissions: Permission[] = [
    "users:read",
    "users:create",
    "users:update",
    "users:disable",
    "users:enable",
    "users:reset-password",
  ];

  for (const permission of userPermissions) {
    assert.equal(getRolePermissions(UserRole.owner).includes(permission), true);
    assert.equal(
      getRolePermissions(UserRole.member).includes(permission),
      false,
    );
    assert.equal(
      getRolePermissions(UserRole.readonly).includes(permission),
      false,
    );
  }
});

test("permissions guard rejects users without the required user permission", () => {
  const reflector = {
    getAllAndOverride: () => ["users:read"],
  } as unknown as Reflector;
  const guard = new PermissionsGuard(reflector);
  const context = {
    getClass: () => UsersService,
    getHandler: () => UsersService.prototype.findAll,
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          permissions: ["foods:read"],
        },
      }),
    }),
  };

  assert.throws(
    () => guard.canActivate(context as unknown as ExecutionContext),
    ForbiddenException,
  );
});

test("auth rejects inactive users on login and authenticated requests", async () => {
  let storedPasswordHash = "";
  const prisma = {
    appUser: {
      findUnique: async () => ({
        ...createPublicUser({
          active: false,
          id: "inactive-user-id",
          username: "inactive",
        }),
        passwordHash: storedPasswordHash,
      }),
    },
  };
  const authService = createAuthService(prisma);
  storedPasswordHash = authService.hashPassword("inactive-password");

  await assert.rejects(
    () =>
      authService.login({
        password: "inactive-password",
        username: "inactive",
      }),
    {
      message: "Invalid username or password.",
    },
  );
  await assert.rejects(
    () => authService.getAuthenticatedUser("inactive-user-id"),
    {
      message: "Authenticated user was not found.",
    },
  );
});

test("listing users never selects or returns passwordHash", async () => {
  let findManyArgs: unknown;
  const prisma = {
    appUser: {
      findMany: async (args: unknown) => {
        findManyArgs = args;

        return [createPublicUser()];
      },
    },
  };
  const service = createUsersService(createAuthService({}), prisma);
  const users = await service.findAll();
  const select = asRecord(asRecord(findManyArgs).select);

  assert.equal("passwordHash" in select, false);
  assert.equal("passwordHash" in asRecord(users[0]), false);
});

test("disabling the last active owner is rejected", async () => {
  let updateCalls = 0;
  const prisma = {
    appUser: {
      count: async () => 0,
      findUnique: async () =>
        createPublicUser({
          id: "owner-id",
          role: UserRole.owner,
          username: "owner",
        }),
      update: async () => {
        updateCalls += 1;

        return createPublicUser();
      },
    },
  };
  const service = createUsersService(createAuthService({}), prisma);

  await assert.rejects(() => service.disable("owner-id"), BadRequestException);
  assert.equal(updateCalls, 0);
});

test("changing the last active owner to a non-owner role is rejected", async () => {
  let updateCalls = 0;
  const prisma = {
    appUser: {
      count: async () => 0,
      findUnique: async () =>
        createPublicUser({
          id: "owner-id",
          role: UserRole.owner,
          username: "owner",
        }),
      update: async () => {
        updateCalls += 1;

        return createPublicUser();
      },
    },
  };
  const service = createUsersService(createAuthService({}), prisma);

  await assert.rejects(
    () =>
      service.update("owner-id", {
        role: UserRole.member,
      }),
    BadRequestException,
  );
  assert.equal(updateCalls, 0);
});

test("inactive users can be re-enabled without creating a new user", async () => {
  let updateArgs: unknown;
  const inactiveUser = createPublicUser({
    active: false,
    id: "member-id",
  });
  const prisma = {
    appUser: {
      findUnique: async () => inactiveUser,
      update: async (args: unknown) => {
        updateArgs = args;

        return {
          ...inactiveUser,
          active: true,
        };
      },
    },
  };
  const service = createUsersService(createAuthService({}), prisma);
  const enabledUser = await service.enable("member-id");
  const updateData = asRecord(asRecord(updateArgs).data);

  assert.deepEqual(updateData, {
    active: true,
  });
  assert.equal(enabledUser.active, true);
  assert.equal(enabledUser.id, "member-id");
});

test("owner password reset hashes the new password without the current password", async () => {
  let updateArgs: unknown;
  const prisma = {
    appUser: {
      findUnique: async () => createPublicUser({ id: "member-id" }),
      update: async (args: unknown) => {
        updateArgs = args;

        return createPublicUser({ id: "member-id" });
      },
    },
  };
  const authService = createAuthService({});
  const service = createUsersService(authService, prisma);

  await service.resetPassword("member-id", {
    newPassword: "new-password",
  });

  const updateData = asRecord(asRecord(updateArgs).data);
  const passwordHash = updateData.passwordHash;

  assert.equal(typeof passwordHash, "string");
  assert.equal((passwordHash as string).startsWith("scrypt:"), true);
  assert.equal("currentPassword" in updateData, false);
});
