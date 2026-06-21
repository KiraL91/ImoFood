"use client";

import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, Save, UserRound } from "lucide-react";
import { changeCurrentUserPassword, updateCurrentUser } from "@/features/auth/auth-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";
import { useAuth } from "@/providers/auth-provider";

type FormStatus = {
  message: string;
  type: "error" | "success";
};

const roleLabels = {
  member: "Member",
  owner: "Owner",
  readonly: "Readonly",
} as const;

export function UserProfileSettings() {
  const { isAuthenticated, updateUser, user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileStatus, setProfileStatus] = useState<FormStatus | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<FormStatus | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const hasBackendConfigured = Boolean(env.NEXT_PUBLIC_API_BASE_URL);
  const canSubmit = hasBackendConfigured && isAuthenticated;

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setEmail(user?.email ?? "");
  }, [user?.displayName, user?.email]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileStatus(null);
    setIsSavingProfile(true);

    try {
      const updatedUser = await updateCurrentUser({
        displayName,
        email,
      });

      updateUser(updatedUser);
      setProfileStatus({
        message: "Perfil actualizado.",
        type: "success",
      });
    } catch (error) {
      setProfileStatus({
        message:
          error instanceof Error
            ? error.message
            : "No se ha podido actualizar el perfil.",
        type: "error",
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        message: "La nueva contrasena no coincide.",
        type: "error",
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      await changeCurrentUserPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        message: "Contrasena actualizada.",
        type: "success",
      });
    } catch (error) {
      setPasswordStatus({
        message:
          error instanceof Error
            ? error.message
            : "No se ha podido actualizar la contrasena.",
        type: "error",
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Perfil</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Datos basicos de la cuenta activa.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <UserRound className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Datos de usuario</CardTitle>
            <CardDescription>
              {user ? user.username : "Sesion no disponible"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Nombre visible
                  <Input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    disabled={!canSubmit || isSavingProfile}
                    maxLength={80}
                    placeholder="Nombre"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Email
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={!canSubmit || isSavingProfile}
                    maxLength={180}
                    placeholder="correo@ejemplo.com"
                    type="email"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Rol activo</span>
                <Badge variant="secondary">
                  {user ? roleLabels[user.role] : "Sin sesion"}
                </Badge>
              </div>

              {profileStatus && (
                <div
                  className={
                    profileStatus.type === "success"
                      ? "rounded-md border bg-secondary p-3 text-sm"
                      : "rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                  }
                >
                  {profileStatus.message}
                </div>
              )}

              <Button type="submit" disabled={!canSubmit || isSavingProfile}>
                <Save aria-hidden="true" />
                {isSavingProfile ? "Guardando..." : "Guardar perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <KeyRound className="size-5" aria-hidden="true" />
            </div>
            <CardTitle>Contrasena</CardTitle>
            <CardDescription>Actualiza la clave de acceso local.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <label className="space-y-2 text-sm font-medium">
                Contrasena actual
                <Input
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={!canSubmit || isSavingPassword}
                  type="password"
                  autoComplete="current-password"
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Nueva contrasena
                <Input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={!canSubmit || isSavingPassword}
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Confirmar nueva contrasena
                <Input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={!canSubmit || isSavingPassword}
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                />
              </label>

              {passwordStatus && (
                <div
                  className={
                    passwordStatus.type === "success"
                      ? "rounded-md border bg-secondary p-3 text-sm"
                      : "rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                  }
                >
                  {passwordStatus.message}
                </div>
              )}

              <Button type="submit" disabled={!canSubmit || isSavingPassword}>
                <KeyRound aria-hidden="true" />
                {isSavingPassword ? "Guardando..." : "Cambiar contrasena"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
