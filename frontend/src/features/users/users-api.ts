import { apiClient } from "@/lib/api/client";
import {
  managedUserSchema,
  type ManagedUser,
  type ManagedUserRole,
} from "@/lib/types/user";

export type CreateUserInput = {
  displayName?: string;
  email?: string;
  password: string;
  role: ManagedUserRole;
  username: string;
};

export type UpdateUserInput = {
  displayName?: string;
  email?: string;
  role?: ManagedUserRole;
};

export async function getUsers(): Promise<ManagedUser[]> {
  const data = await apiClient<unknown>("/users");

  return managedUserSchema.array().parse(data);
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  const data = await apiClient<unknown>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return managedUserSchema.parse(data);
}

export async function updateUser({
  id,
  input,
}: {
  id: string;
  input: UpdateUserInput;
}): Promise<ManagedUser> {
  const data = await apiClient<unknown>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return managedUserSchema.parse(data);
}

export async function disableUser(id: string): Promise<ManagedUser> {
  const data = await apiClient<unknown>(`/users/${id}/disable`, {
    method: "PATCH",
  });

  return managedUserSchema.parse(data);
}

export async function enableUser(id: string): Promise<ManagedUser> {
  const data = await apiClient<unknown>(`/users/${id}/enable`, {
    method: "PATCH",
  });

  return managedUserSchema.parse(data);
}
