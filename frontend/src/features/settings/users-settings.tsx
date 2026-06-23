"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  KeyRound,
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
  useRoleCatalog,
  useResetUserPassword,
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
import type { Permission } from "@/lib/types/auth";
import type { ManagedUser, ManagedUserRole } from "@/lib/types/user";
import { formatDateTime } from "@/lib/utils/format-date";
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

type UserAction = "disable" | "enable";

type UserActionConfirmation = {
  action: UserAction;
  confirmation: string;
  status: FormStatus | null;
  user: ManagedUser;
};

type PermissionGroup = {
  label: string;
  permissions: Permission[];
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

const rolePermissionGroups: PermissionGroup[] = [
  {
    label: "Alimentos",
    permissions: ["foods:read", "foods:create", "foods:update", "foods:delete"],
  },
  {
    label: "Recetas",
    permissions: ["recipes:read", "recipes:create", "recipes:update", "recipes:delete"],
  },
  {
    label: "Diario",
    permissions: [
      "meal-logs:read",
      "meal-logs:create",
      "meal-logs:update",
      "meal-logs:delete",
    ],
  },
  {
    label: "Sintomas",
    permissions: [
      "symptom-logs:read",
      "symptom-logs:create",
      "symptom-logs:update",
      "symptom-logs:delete",
    ],
  },
  {
    label: "Tratamientos",
    permissions: [
      "treatments:read",
      "treatments:create",
      "treatments:update",
      "treatments:delete",
      "treatment-logs:read",
      "treatment-logs:create",
      "treatment-logs:update",
      "treatment-logs:delete",
    ],
  },
  {
    label: "IA",
    permissions: ["ai-suggestions:read", "ai-suggestions:create"],
  },
  {
    label: "Usuarios",
    permissions: [
      "users:read",
      "users:create",
      "users:update",
      "users:disable",
      "users:enable",
      "users:reset-password",
    ],
  },
];

const userActionCopy: Record<
  UserAction,
  {
    confirmLabel: string;
    errorMessage: string;
    pendingLabel: string;
    submitLabel: string;
    title: string;
  }
> = {
  disable: {
    confirmLabel: "Confirmar desactivacion",
    errorMessage: "No se ha podido desactivar.",
    pendingLabel: "Desactivando...",
    submitLabel: "Desactivar usuario",
    title: "Desactivar usuario",
  },
  enable: {
    confirmLabel: "Confirmar activacion",
    errorMessage: "No se ha podido activar.",
    pendingLabel: "Activando...",
    submitLabel: "Activar usuario",
    title: "Activar usuario",
  },
};

export function UsersSettings() {
  const { hasPermission, logout, updateUser: updateSessionUser, user } = useAuth();
  const canReadUsers = hasPermission("users:read");
  const canCreateUsers = hasPermission("users:create");
  const canUpdateUsers = hasPermission("users:update");
  const canDisableUsers = hasPermission("users:disable");
  const canEnableUsers = hasPermission("users:enable");
  const canResetUserPasswords = hasPermission("users:reset-password");
  const usersQuery = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const disableUserMutation = useDisableUser();
  const enableUserMutation = useEnableUser();
  const resetUserPasswordMutation = useResetUserPassword();
  const roleCatalogQuery = useRoleCatalog();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [userActionConfirmation, setUserActionConfirmation] =
    useState<UserActionConfirmation | null>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [resettingUser, setResettingUser] = useState<ManagedUser | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>(emptyCreateForm);
  const [editForm, setEditForm] = useState<EditUserForm>({
    displayName: "",
    email: "",
    role: "member",
  });
  const [editRoleConfirmation, setEditRoleConfirmation] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [resetPasswordUserConfirmation, setResetPasswordUserConfirmation] = useState("");
  const [createStatus, setCreateStatus] = useState<FormStatus | null>(null);
  const [editStatus, setEditStatus] = useState<FormStatus | null>(null);
  const [resetPasswordStatus, setResetPasswordStatus] = useState<FormStatus | null>(null);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const roleCatalog = useMemo(() => roleCatalogQuery.data ?? [], [roleCatalogQuery.data]);
  const roleCatalogByRole = useMemo(
    () =>
      new Map(
        roleCatalog.map((roleCatalogItem) => [roleCatalogItem.role, roleCatalogItem]),
      ),
    [roleCatalog],
  );
  const userById = useMemo(
    () => new Map(users.map((managedUser) => [managedUser.id, managedUser])),
    [users],
  );

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
    setEditRoleConfirmation("");
    setEditStatus(null);
    setEditOpen(true);
  }

  function closeEditDialog() {
    setEditOpen(false);
    setEditingUser(null);
    setEditRoleConfirmation("");
    setEditStatus(null);
  }

  function openResetPasswordDialog(managedUser: ManagedUser) {
    setResettingUser(managedUser);
    setResetPassword("");
    setResetPasswordConfirm("");
    setResetPasswordUserConfirmation("");
    setResetPasswordStatus(null);
    setResetPasswordOpen(true);
  }

  function closeResetPasswordDialog() {
    setResetPasswordOpen(false);
    setResettingUser(null);
    setResetPassword("");
    setResetPasswordConfirm("");
    setResetPasswordUserConfirmation("");
    setResetPasswordStatus(null);
  }

  function openUserActionConfirmation(managedUser: ManagedUser, action: UserAction) {
    setUserActionConfirmation({
      action,
      confirmation: "",
      status: null,
      user: managedUser,
    });
  }

  function closeUserActionConfirmation() {
    setUserActionConfirmation(null);
  }

  function getActorLabel(userId?: string) {
    if (!userId) {
      return undefined;
    }

    return userById.get(userId)?.username ?? "usuario desconocido";
  }

  function getAuditLines(managedUser: ManagedUser) {
    const lines: string[] = [];

    if (!managedUser.active && managedUser.lastDisabledAt) {
      const actorLabel = getActorLabel(managedUser.lastDisabledByUserId);
      lines.push(
        `Desactivado ${formatDateTime(managedUser.lastDisabledAt)}${
          actorLabel ? ` por ${actorLabel}` : ""
        }`,
      );
    }

    if (managedUser.active && managedUser.lastEnabledAt) {
      const actorLabel = getActorLabel(managedUser.lastEnabledByUserId);
      lines.push(
        `Reactivado ${formatDateTime(managedUser.lastEnabledAt)}${
          actorLabel ? ` por ${actorLabel}` : ""
        }`,
      );
    }

    if (managedUser.passwordResetAt) {
      const actorLabel = getActorLabel(managedUser.passwordResetByUserId);
      lines.push(
        `Clave reset ${formatDateTime(managedUser.passwordResetAt)}${
          actorLabel ? ` por ${actorLabel}` : ""
        }`,
      );
    }

    return lines;
  }

  function getRoleLabel(role: ManagedUserRole) {
    return roleCatalogByRole.get(role)?.label ?? roleLabels[role];
  }

  function summarizePermissions(
    permissions: Permission[],
    permissionGroup: PermissionGroup,
  ) {
    const permissionSet = new Set(permissions);
    const grantedCount = permissionGroup.permissions.filter((permission) =>
      permissionSet.has(permission),
    ).length;

    if (grantedCount === 0) {
      return "Sin acceso";
    }

    if (grantedCount === permissionGroup.permissions.length) {
      return "Completo";
    }

    if (
      grantedCount === 1 &&
      permissionSet.has(permissionGroup.permissions[0] as Permission)
    ) {
      return "Lectura";
    }

    return "Edicion";
  }

  function getPermissionSummaryVariant(
    summary: string,
  ): "default" | "outline" | "secondary" {
    if (summary === "Sin acceso") {
      return "outline";
    }

    return summary === "Completo" ? "default" : "secondary";
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

    if (
      editForm.role !== editingUser.role &&
      editRoleConfirmation !== editingUser.username
    ) {
      setEditStatus({
        message: "Escribe el usuario exacto para confirmar el cambio de rol.",
        type: "error",
      });
      return;
    }

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
      closeEditDialog();
    } catch (error) {
      setEditStatus({
        message: error instanceof Error ? error.message : "No se ha podido guardar.",
        type: "error",
      });
    }
  }

  async function handleResetPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resettingUser) {
      return;
    }

    setResetPasswordStatus(null);

    if (resetPassword !== resetPasswordConfirm) {
      setResetPasswordStatus({
        message: "La nueva contrasena no coincide.",
        type: "error",
      });
      return;
    }

    if (resetPasswordUserConfirmation !== resettingUser.username) {
      setResetPasswordStatus({
        message: "Escribe el usuario exacto para confirmar el reseteo.",
        type: "error",
      });
      return;
    }

    try {
      await resetUserPasswordMutation.mutateAsync({
        id: resettingUser.id,
        input: {
          newPassword: resetPassword,
        },
      });
      closeResetPasswordDialog();
    } catch (error) {
      setResetPasswordStatus({
        message:
          error instanceof Error
            ? error.message
            : "No se ha podido resetear la contrasena.",
        type: "error",
      });
    }
  }

  async function handleUserActionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userActionConfirmation) {
      return;
    }

    if (userActionConfirmation.confirmation !== userActionConfirmation.user.username) {
      setUserActionConfirmation((current) =>
        current
          ? {
              ...current,
              status: {
                message: "Escribe el usuario exacto para confirmar la accion.",
                type: "error",
              },
            }
          : current,
      );
      return;
    }

    const confirmedAction = userActionConfirmation;
    const { action, user: managedUser } = confirmedAction;

    try {
      if (action === "disable") {
        const disabledUser = await disableUserMutation.mutateAsync(managedUser.id);

        if (disabledUser.id === user?.id) {
          logout();
        }
      } else {
        await enableUserMutation.mutateAsync(managedUser.id);
      }

      closeUserActionConfirmation();
    } catch (error) {
      setUserActionConfirmation((current) =>
        current
          ? {
              ...current,
              status: {
                message:
                  error instanceof Error
                    ? error.message
                    : userActionCopy[confirmedAction.action].errorMessage,
                type: "error",
              },
            }
          : current,
      );
    }
  }

  function isLastActiveOwner(managedUser: ManagedUser) {
    return managedUser.active && managedUser.role === "owner" && activeOwnerCount <= 1;
  }

  const isUserActionPending =
    disableUserMutation.isPending || enableUserMutation.isPending;
  const activeUserAction = userActionConfirmation
    ? userActionCopy[userActionConfirmation.action]
    : null;
  const isUserActionConfirmed = userActionConfirmation
    ? userActionConfirmation.confirmation === userActionConfirmation.user.username
    : false;
  const needsRoleConfirmation = Boolean(
    editingUser && editForm.role !== editingUser.role,
  );
  const isRoleChangeConfirmed =
    !needsRoleConfirmation ||
    Boolean(editingUser && editRoleConfirmation === editingUser.username);
  const isResetPasswordUserConfirmed = Boolean(
    resettingUser && resetPasswordUserConfirmation === resettingUser.username,
  );

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
                    <Badge variant="secondary">{getRoleLabel(managedUser.role)}</Badge>
                  </div>

                  <div>
                    <Badge variant={managedUser.active ? "default" : "outline"}>
                      {managedUser.active ? "Activo" : "Inactivo"}
                    </Badge>
                    {getAuditLines(managedUser).map((auditLine) => (
                      <div
                        key={auditLine}
                        className="mt-1 text-xs leading-5 text-muted-foreground"
                      >
                        {auditLine}
                      </div>
                    ))}
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
                    {canResetUserPasswords && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openResetPasswordDialog(managedUser)}
                        title="Resetear contrasena"
                        aria-label={`Resetear contrasena de ${managedUser.username}`}
                      >
                        <KeyRound aria-hidden="true" />
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
                        onClick={() => openUserActionConfirmation(managedUser, "disable")}
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
                        onClick={() => openUserActionConfirmation(managedUser, "enable")}
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

      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            {roleCatalog.length > 0
              ? `${roleCatalog.length} roles del sistema`
              : "Roles del sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roleCatalogQuery.isLoading && (
            <div className="rounded-md border bg-secondary p-3 text-sm">
              Cargando roles...
            </div>
          )}

          {roleCatalogQuery.isError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              No se han podido cargar los roles.
            </div>
          )}

          {!roleCatalogQuery.isLoading && !roleCatalogQuery.isError && (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-[720px] table-fixed text-left text-sm">
                <thead className="bg-secondary text-xs text-muted-foreground">
                  <tr>
                    <th className="w-36 px-4 py-3 font-medium uppercase" scope="col">
                      Area
                    </th>
                    {roleCatalog.map((roleCatalogItem) => (
                      <th
                        key={roleCatalogItem.role}
                        className="px-4 py-3 align-top"
                        scope="col"
                      >
                        <div className="text-sm font-semibold text-foreground">
                          {roleCatalogItem.label}
                        </div>
                        <div className="mt-1 normal-case leading-5">
                          {roleCatalogItem.description}
                        </div>
                        <div className="mt-1 font-normal normal-case">
                          {roleCatalogItem.permissions.length} permisos
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rolePermissionGroups.map((permissionGroup) => (
                    <tr key={permissionGroup.label} className="border-t">
                      <th
                        className="px-4 py-3 text-sm font-medium text-foreground"
                        scope="row"
                      >
                        {permissionGroup.label}
                      </th>
                      {roleCatalog.map((roleCatalogItem) => {
                        const summary = summarizePermissions(
                          roleCatalogItem.permissions,
                          permissionGroup,
                        );

                        return (
                          <td key={roleCatalogItem.role} className="px-4 py-3">
                            <Badge variant={getPermissionSummaryVariant(summary)}>
                              {summary}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {roleCatalog.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No hay roles disponibles.
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
                    username: event.target.value.toLowerCase(),
                  }))
                }
                autoCapitalize="none"
                autoComplete="username"
                disabled={createUserMutation.isPending}
                inputMode="text"
                maxLength={50}
                minLength={3}
                pattern="[a-z0-9_-]{3,50}"
                required
                title="Usa 3-50 caracteres: letras minusculas, numeros, guion o guion bajo."
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
                    {getRoleLabel(role)}
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
        open={resetPasswordOpen}
        onOpenChange={(open) => {
          if (open) {
            setResetPasswordOpen(true);
          } else {
            closeResetPasswordDialog();
          }
        }}
        title="Resetear contrasena"
        description={resettingUser?.username}
        className="max-w-2xl"
      >
        <form className="space-y-4" onSubmit={handleResetPasswordSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Nueva contrasena
              <Input
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                disabled={resetUserPasswordMutation.isPending}
                minLength={8}
                maxLength={128}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Confirmar contrasena
              <Input
                value={resetPasswordConfirm}
                onChange={(event) => setResetPasswordConfirm(event.target.value)}
                disabled={resetUserPasswordMutation.isPending}
                minLength={8}
                maxLength={128}
                type="password"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          {resettingUser && (
            <label className="block space-y-2 text-sm font-medium">
              Confirmar usuario
              <Input
                value={resetPasswordUserConfirmation}
                onChange={(event) => setResetPasswordUserConfirmation(event.target.value)}
                autoComplete="off"
                disabled={resetUserPasswordMutation.isPending}
                placeholder={resettingUser.username}
                required
              />
              <span className="block text-xs leading-5 text-muted-foreground">
                Escribe {resettingUser.username} para resetear su contrasena.
              </span>
            </label>
          )}

          {resetPasswordStatus && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {resetPasswordStatus.message}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeResetPasswordDialog}
              disabled={resetUserPasswordMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                resetUserPasswordMutation.isPending || !isResetPasswordUserConfirmed
              }
            >
              <KeyRound aria-hidden="true" />
              {resetUserPasswordMutation.isPending
                ? "Guardando..."
                : "Resetear contrasena"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (open) {
            setEditOpen(true);
          } else {
            closeEditDialog();
          }
        }}
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
                    {getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {needsRoleConfirmation && editingUser && (
            <label className="block space-y-2 text-sm font-medium">
              Confirmar cambio de rol
              <Input
                value={editRoleConfirmation}
                onChange={(event) => setEditRoleConfirmation(event.target.value)}
                autoComplete="off"
                disabled={updateUserMutation.isPending}
                placeholder={editingUser.username}
                required
              />
              <span className="block text-xs leading-5 text-muted-foreground">
                Escribe {editingUser.username} para cambiar su rol a{" "}
                {getRoleLabel(editForm.role)}.
              </span>
            </label>
          )}

          {editStatus && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {editStatus.message}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditDialog}
              disabled={updateUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending || !isRoleChangeConfirmed}
            >
              <ShieldCheck aria-hidden="true" />
              {updateUserMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Dialog>

      {activeUserAction && userActionConfirmation && (
        <Dialog
          open={Boolean(userActionConfirmation)}
          onOpenChange={(open) => {
            if (!open) {
              closeUserActionConfirmation();
            }
          }}
          title={activeUserAction.title}
          description={userActionConfirmation.user.username}
          className="max-w-lg"
        >
          <form className="space-y-4" onSubmit={handleUserActionSubmit}>
            <label className="block space-y-2 text-sm font-medium">
              {activeUserAction.confirmLabel}
              <Input
                value={userActionConfirmation.confirmation}
                onChange={(event) =>
                  setUserActionConfirmation((current) =>
                    current
                      ? {
                          ...current,
                          confirmation: event.target.value,
                          status: null,
                        }
                      : current,
                  )
                }
                autoComplete="off"
                disabled={isUserActionPending}
                placeholder={userActionConfirmation.user.username}
                required
              />
              <span className="block text-xs leading-5 text-muted-foreground">
                Escribe {userActionConfirmation.user.username} para confirmar.
              </span>
            </label>

            {userActionConfirmation.status && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {userActionConfirmation.status.message}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeUserActionConfirmation}
                disabled={isUserActionPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={
                  userActionConfirmation.action === "disable" ? "destructive" : "default"
                }
                disabled={isUserActionPending || !isUserActionConfirmed}
              >
                {userActionConfirmation.action === "disable" ? (
                  <UserMinus aria-hidden="true" />
                ) : (
                  <UserCheck aria-hidden="true" />
                )}
                {isUserActionPending
                  ? activeUserAction.pendingLabel
                  : activeUserAction.submitLabel}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
