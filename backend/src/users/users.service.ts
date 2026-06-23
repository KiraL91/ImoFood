import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";

import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import type { User } from "./types/user";

const userSelect = {
  active: true,
  createdAt: true,
  displayName: true,
  email: true,
  id: true,
  role: true,
  updatedAt: true,
  username: true,
} satisfies Prisma.AppUserSelect;

type UserRecord = Prisma.AppUserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.appUser.findMany({
      orderBy: [{ active: "desc" }, { username: "asc" }],
      select: userSelect,
    });

    return users.map((user) => this.toUser(user));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const username = this.normalizeUsername(createUserDto.username);
    const email = this.normalizeEmail(createUserDto.email);

    await this.assertUniqueUsername(username);
    await this.assertUniqueEmail(email);

    const user = await this.prisma.appUser.create({
      data: {
        displayName: this.normalizeNullable(createUserDto.displayName),
        email,
        passwordHash: this.authService.hashPassword(createUserDto.password),
        role: createUserDto.role,
        username,
      },
      select: userSelect,
    });

    return this.toUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findUserOrThrow(id);
    const data: Prisma.AppUserUpdateInput = {};

    if (updateUserDto.displayName !== undefined) {
      data.displayName = this.normalizeNullable(updateUserDto.displayName);
    }

    if (updateUserDto.email !== undefined) {
      const email = this.normalizeEmail(updateUserDto.email);
      await this.assertUniqueEmail(email, id);
      data.email = email;
    }

    if (updateUserDto.role !== undefined) {
      if (
        existingUser.active &&
        existingUser.role === UserRole.owner &&
        updateUserDto.role !== UserRole.owner
      ) {
        await this.assertAnotherActiveOwner(id);
      }

      data.role = updateUserDto.role;
    }

    const updatedUser = await this.prisma.appUser.update({
      data,
      select: userSelect,
      where: {
        id,
      },
    });

    return this.toUser(updatedUser);
  }

  async disable(id: string): Promise<User> {
    const existingUser = await this.findUserOrThrow(id);

    if (!existingUser.active) {
      return this.toUser(existingUser);
    }

    if (existingUser.role === UserRole.owner) {
      await this.assertAnotherActiveOwner(id);
    }

    const updatedUser = await this.prisma.appUser.update({
      data: {
        active: false,
      },
      select: userSelect,
      where: {
        id,
      },
    });

    return this.toUser(updatedUser);
  }

  async enable(id: string): Promise<User> {
    const existingUser = await this.findUserOrThrow(id);

    if (existingUser.active) {
      return this.toUser(existingUser);
    }

    const updatedUser = await this.prisma.appUser.update({
      data: {
        active: true,
      },
      select: userSelect,
      where: {
        id,
      },
    });

    return this.toUser(updatedUser);
  }

  private async assertAnotherActiveOwner(userId: string): Promise<void> {
    const activeOwnerCount = await this.prisma.appUser.count({
      where: {
        active: true,
        id: {
          not: userId,
        },
        role: UserRole.owner,
      },
    });

    if (activeOwnerCount === 0) {
      throw new BadRequestException("At least one active owner is required.");
    }
  }

  private async assertUniqueEmail(
    email: string | null,
    excludedUserId?: string,
  ): Promise<void> {
    if (!email) {
      return;
    }

    const existingUser = await this.prisma.appUser.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.id !== excludedUserId) {
      throw new ConflictException("Email is already in use.");
    }
  }

  private async assertUniqueUsername(
    username: string,
    excludedUserId?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.appUser.findUnique({
      where: {
        username,
      },
    });

    if (existingUser && existingUser.id !== excludedUserId) {
      throw new ConflictException("Username is already in use.");
    }
  }

  private async findUserOrThrow(id: string): Promise<UserRecord> {
    const user = await this.prisma.appUser.findUnique({
      select: userSelect,
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" was not found.`);
    }

    return user;
  }

  private normalizeEmail(email?: string): string | null {
    const normalizedEmail = email?.trim().toLowerCase();

    return normalizedEmail || null;
  }

  private normalizeNullable(value?: string): string | null {
    const normalizedValue = value?.trim();

    return normalizedValue || null;
  }

  private normalizeUsername(username: string): string {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      throw new BadRequestException("Username is required.");
    }

    return normalizedUsername;
  }

  private toUser(user: UserRecord): User {
    return {
      active: user.active,
      createdAt: user.createdAt.toISOString(),
      displayName: user.displayName ?? undefined,
      email: user.email ?? undefined,
      id: user.id,
      role: user.role,
      updatedAt: user.updatedAt.toISOString(),
      username: user.username,
    };
  }
}
