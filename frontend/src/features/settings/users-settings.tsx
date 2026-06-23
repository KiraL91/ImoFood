"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Pencil,
  Plus,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UsersRound,
} from "lucide-react";
import { getCurrentUser } from "@/features/auth/auth-api";
import {
  useCreateUser,
  useDisableUser,
  useEnableUser,
  useUpdateUser,
  useUsers,
} from "@/features/users/users-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ManagedUser, ManagedUserRole } from "@/lib/types/user";
import { useAuth } from "@/providers/auth-provider";

type FormStatus = {
  message: string;
  type: "error" | "success";
};

type CreateUserForm = {
  displayName: string;
  email: string;
  password: string;
  role: ManagedUserRole;
  username: string;
};

type EditUserForm = {
  displayName: string;
  email: string;
  role: ManagedUserRole;
};

const emptyCreateForm: CreateUserForm = {
  displayName: "",
  email: "",
  password: "",
  role: "member",
  username: "",
};

const roleLabels: Record<ManagedUserRole, string> = {
  member: "Member",
  owner: "Owner",
  readonly: "Readonly",
};

const roleOptions: ManagedUserRole[] = ["owner", "member", "readonly"];

export function UsersSettings() {
  const { hasPermission, logout, updateUser: updateSessionUser, user } = useAuth();
  const canReadUsers = hasPermission("users:read");
  const canCreateUsers = hasPermission("users:create");
  const canUpdateUsers = hasPermission("users:update");
  const canDisableUsers = hasPermission("users:disable");
  const canEnableUsers = hasPermission("users:enable");
  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const disableUserMutation = useDisableUser();
  const enableUserMutation = useEnableUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditUserForm>({
    displayName: "",
    email: "",
    role: "member",
  });
  const [createStatus, setCreateStatus] = useState<FormStatus | null>(null);
  const [editStatus, setEditStatus] = useState<FormStatus | null>(null);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  const activeOwnerCount = useMemo(
    () =>
      users.filter((managedUser) => managedUser.active && managedUser.role === "owner")
        .length,
    [users],
  );

  if (!canReadUsers) {
    return null;
  }

  function openCreateDialog() {
    setCreateForm(emptyCreateForm);
    setCreateStatus(null);
    setCreateOpen(true);
  }

  function openEditDialog(managedUser: ManagedUser) {
    setEditingUser(managedUser);
    setEditForm({
      displayName: managedUser.displayName ?? "",
      email: managedUser.email ?? "",
      role: managedUser.role,
    });
    setEditStatus(null);
    setEditOpen(true);
  }

  async function refreshCurrentUserIfNeeded(managedUserId: string) {
    if (managedUserId !== user?.id) {
      return;
    }

    const refreshedUser = await getCurrentUser();
    updateSessionUser(refreshedUser);
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateStatus(null);

    try {
      await createUserMutation.mutateAsync({
        displayName: createForm.displayName,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        username: createForm.username,
      });
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
    } catch (error) {
      setCreateStatus({
        message: error instanceof Error ? error.message : "No se ha podido crear.",
        type: "error",
      });
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setEditStatus(null);

    try {
      const updatedUser = await updateUserMutation.mutateAsync({
        id: editingUser.id,
        input: {
          displayName: editForm.displayName,
          email: editForm.email,
          role: editForm.role,
        },
      });

      await refreshCurrentUserIfNeeded(updatedUser.id);
      setEditOpen(false);
      setEditingUser(null);
    } catch (error) {
      setEditStatus({
        message: error instanceof Error ? error.message : "No se ha podido guardar.",
        type: "error",
      });
    }
  }

  async function handleDisable(managedUser: ManagedUser) {
    if (!managedUser.active) {
      return;
    }

    if (!window.confirm(`Desactivar ${managedUser.username}?`)) {
      return;
    }

    try {
      const disabledUser = await disableUserMutation.mutateAsync(managedUser.id);

      if (disabledUser.id === user?.id) {
        logout();
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "No se ha podido desactivar.",
      );
    }
  }

  async function handleEnable(managedUser: ManagedUser) {
    if (managedUser.active) {
      return;
    }

    try {
      await enableUserMutation.mutateAsync(managedUser.id);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No se ha podido activar.");
    }
  }

  function isLastActiveOwner(managedUser: ManagedUser) {
    return managedUser.active && managedUser.role === "owner" && activeOwnerCount <= 1;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Usuarios</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Accesos disponibles para esta instalacion.
          </p>
        </div>
        {canCreateUsers && (
          <Button type="button" onClick={openCreateDialog}>
            <Plus aria-hidden="true" />
            Crear
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <UsersRound className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Cuentas</CardTitle>
          <CardDescription>
            {users.length === 1 ? "1 usuario" : `${users.length} usuarios`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersQuery.isLoading && (
            <div className="rounded-md border bg-secondary p-3 text-sm">
              Cargando usuarios...
            </div>
          )}

          {usersQuery.isError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              No se han podido cargar los usuarios.
            </div>
          )}

          {!usersQuery.isLoading && !usersQuery.isError && (
            <div className="overflow-hidden rounded-md border">
              <div className="hidden grid-cols-[1.1fr_1.3fr_0.7fr_0.7fr_auto] gap-3 bg-secondary px-4 py-2 text-xs font-medium uppercase text-muted-foreground md:grid">
                <span>Usuario</span>
                <span>Contacto</span>
                <span>Rol</span>
                <span>Estado</span>
                <span className="text-right">Acciones</span>
              </div>

              {users.map((managedUser) => (
                <div
                  key={managedUser.id}
                  className="grid gap-3 border-t px-4 py-3 md:grid-cols-[1.1fr_1.3fr_0.7fr_0.7fr_auto] md:items-center md:first:border-t-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {managedUser.username}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {managedUser.displayName || "Sin nombre visible"}
                    </div>
                  </div>

                  <div className="min-w-0 text-sm text-muted-foreground">
                    <div className="truncate">{managedUser.email || "Sin email"}</div>
                  </div>

                  <div>
                    <Badge variant="secondary">{roleLabels[managedUser.role]}</Badge>
                  </div>

                  <div>
                    <Badge variant={managedUser.active ? "default" : "outline"}>
                      {managedUser.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="flex justify-end gap-2">
                    {canUpdateUsers && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(managedUser)}
                        title="Editar usuario"
                        aria-label={`Editar ${managedUser.username}`}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                    )}
                    {managedUser.active && canDisableUsers && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={
                          !managedUser.active ||
                          disableUserMutation.isPending ||
                          isLastActiveOwner(managedUser)
                        }
                        onClick={() => handleDisable(managedUser)}
                        title="Desactivar usuario"
                        aria-label={`Desactivar ${managedUser.username}`}
                      >
                        <UserMinus aria-hidden="true" />
                      </Button>
                    )}
                    {!managedUser.active && canEnableUsers && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={enableUserMutation.isPending}
                        onClick={() => handleEnable(managedUser)}
                        title="Activar usuario"
                        aria-label={`Activar ${managedUser.username}`}
                      >
                        <UserCheck aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No hay usuarios registrados.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Crear usuario"
        description="Alta de una cuenta con rol inicial."
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Usuario
              <Input
                value={createForm.username}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                disabled={createUserMutation.isPending}
                maxLength={50}
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Contrasena inicial
              <Input
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                disabled={createUserMutation.isPending}
                minLength={8}
                maxLength={128}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Nombre visible
              <Input
                value={createForm.displayName}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                disabled={createUserMutation.isPending}
                maxLength={80}
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Email
              <Input
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                disabled={createUserMutation.isPending}
                maxLength={180}
                type="email"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Rol
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    role: event.target.value as ManagedUserRole,
                  }))
                }
                disabled={createUserMutation.isPending}
                className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {createStatus && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {createStatus.message}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={createUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              <ShieldCheck aria-hidden="true" />
              {createUserMutation.isPending ? "Creando..." : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Editar usuario"
        description={editingUser?.username}
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Nombre visible
              <Input
                value={editForm.displayName}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
                disabled={updateUserMutation.isPending}
                maxLength={80}
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Email
              <Input
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                disabled={updateUserMutation.isPending}
                maxLength={180}
                type="email"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Rol
              <select
                value={editForm.role}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    role: event.target.value as ManagedUserRole,
                  }))
                }
                disabled={updateUserMutation.isPending}
                className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roleOptions.map((role) => (
                  <option
                    key={role}
                    value={role}
                    disabled={
                      Boolean(editingUser && isLastActiveOwner(editingUser)) &&
                      role !== "owner"
                    }
                  >
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {editStatus && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {editStatus.message}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={updateUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              <ShieldCheck aria-hidden="true" />
              {updateUserMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
