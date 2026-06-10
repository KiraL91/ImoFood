import { Database, ShieldCheck, Smartphone, WifiOff } from "lucide-react";
import { PreferenceCard } from "@/components/settings/preference-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { env } from "@/lib/env";
import { preferences } from "@/lib/mock/preferences";

const settings = [
  {
    label: "Datos",
    value: "Mock local",
    icon: Database,
  },
  {
    label: "API",
    value: env.NEXT_PUBLIC_API_BASE_URL ? "Configurada" : "Pendiente",
    icon: WifiOff,
  },
  {
    label: "PWA",
    value: "Manifest preparado",
    icon: Smartphone,
  },
  {
    label: "Validacion",
    value: "Zod activo",
    icon: ShieldCheck,
  },
];

export function SettingsPanel() {
  const preferenceByKey = new Map(
    preferences.map((preference) => [preference.key, preference.value]),
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.value}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-2 rounded-sm bg-muted">
                  <div className="h-2 w-2/3 rounded-sm bg-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section>
        <h3 className="text-lg font-semibold">Preferencias MVP</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Configuracion mock preparada para sincronizar con el backend.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PreferenceCard
          title="Modo seguro"
          description="Prioriza alimentos permitidos y recetas simples."
          value={preferenceByKey.get("safeMode")}
        />
        <PreferenceCard
          title="Tags preferidos"
          description="Etiquetas que aumentan prioridad en ideas de comida."
          value={preferenceByKey.get("preferredTags")}
        />
        <PreferenceCard
          title="Tags evitados"
          description="Etiquetas que deberian reducirse en sugerencias."
          value={preferenceByKey.get("avoidedTags")}
        />
        <PreferenceCard
          title="Tipos de comida habituales"
          description="Plantillas de comida para accesos rapidos."
          value={preferenceByKey.get("usualMealTypes")}
        />
        <PreferenceCard
          title="IA activada/desactivada"
          description="Bandera futura para sugerencias inteligentes."
          value={preferenceByKey.get("aiEnabled")}
        />
        <PreferenceCard
          title="Estado integracion backend"
          description="Contrato actual de datos del frontend."
          value={preferenceByKey.get("backendIntegration")}
        />
      </section>
    </div>
  );
}
