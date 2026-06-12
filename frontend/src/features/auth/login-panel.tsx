"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import type { UserRole } from "@/lib/types/auth";

const accessHints = [
  "Datos personales aislados por usuario.",
  "Permisos preparados para roles.",
  "OAuth con Google previsto.",
];

const demoRoles: Array<{
  description: string;
  label: string;
  role: UserRole;
}> = [
  {
    description: "Gestiona todo el catalogo.",
    label: "Owner",
    role: "owner",
  },
  {
    description: "Crea y edita, sin borrar.",
    label: "Member",
    role: "member",
  },
  {
    description: "Solo consulta datos.",
    label: "Readonly",
    role: "readonly",
  },
];

export function LoginPanel() {
  const router = useRouter();
  const { isAuthenticated, login, user } = useAuth();
  const [username, setUsername] = useState("owner");
  const [password, setPassword] = useState("owner");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function fillDemoCredentials(role: UserRole) {
    setUsername(role);
    setPassword(role);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ password, username });
      router.push("/");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "No se ha podido iniciar sesion.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[1fr_460px]">
      <section className="hidden border-r bg-secondary/40 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">IMO Meals</p>
            <h1 className="text-xl font-semibold leading-7">Acceso seguro</h1>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase text-muted-foreground">
            Espacio personal
          </p>
          <h2 className="mt-3 max-w-lg text-4xl font-semibold leading-tight">
            Tu seguimiento digestivo, recetas y alimentos en un entorno privado.
          </h2>
          <div className="mt-8 grid gap-3">
            {accessHints.map((hint) => (
              <div key={hint} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                <span>{hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 text-sm leading-6 text-muted-foreground">
          Los datos sensibles como sintomas, medicacion y preferencias quedaran protegidos
          por permisos antes de conectar OAuth con Google.
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-5">
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IMO Meals</p>
                <h1 className="text-lg font-semibold leading-6">Acceso seguro</h1>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <LockKeyhole className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>Iniciar sesion</CardTitle>
              <CardDescription>
                Usa un usuario de prueba para validar permisos por rol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  {demoRoles.map((demoRole) => (
                    <button
                      key={demoRole.role}
                      type="button"
                      onClick={() => fillDemoCredentials(demoRole.role)}
                      className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      <span className="block font-medium">{demoRole.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        usuario: {demoRole.role} / clave: {demoRole.role}.{" "}
                        {demoRole.description}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="space-y-2 text-sm font-medium">
                  Usuario
                  <span className="relative block">
                    <UserRound
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="owner"
                      className="pl-9"
                      autoComplete="username"
                    />
                  </span>
                </label>

                <label className="space-y-2 text-sm font-medium">
                  Contrasena
                  <span className="relative block">
                    <KeyRound
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      placeholder="owner"
                      className="pl-9"
                      autoComplete="current-password"
                    />
                  </span>
                </label>

                {error && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {isAuthenticated && user && (
                  <div className="rounded-md border bg-secondary p-3 text-sm">
                    Sesion activa como <strong>{user.username}</strong> ({user.role}).
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                  <ArrowRight aria-hidden="true" />
                </Button>

                <div className="relative py-1 text-center text-xs text-muted-foreground">
                  <span className="bg-card px-2">futuro</span>
                  <span className="absolute left-0 top-1/2 -z-10 h-px w-full bg-border" />
                </div>

                <Button type="button" variant="outline" className="w-full" disabled>
                  <ShieldCheck aria-hidden="true" />
                  Continuar con Google
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <span>Auth local de MVP</span>
          </div>
        </div>
      </section>
    </main>
  );
}
