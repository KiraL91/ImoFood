import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function NewFoodDraftCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
            <Database className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Nuevo alimento</CardTitle>
            <CardDescription>
              Entrada visual preparada para ampliar la base de conocimiento.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm font-medium">
          Nombre
          <Input placeholder="Ej. Pavo cocido" />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Categoria
          <Input placeholder="Proteina, verdura, fruta..." />
        </label>

        <label className="space-y-2 text-sm font-medium">
          Estado
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="allowed">Permitido</option>
            <option value="testing">En prueba</option>
            <option value="caution">Dudoso</option>
            <option value="avoid">Prohibido</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium">
          Tolerancia
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            <option value="5">5 - Muy buena</option>
            <option value="4">4 - Buena</option>
            <option value="3">3 - Media</option>
            <option value="2">2 - Baja</option>
            <option value="1">1 - Mala</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Tags
          <Input placeholder="base, rapido, sin gluten" />
        </label>

        <label className="space-y-2 text-sm font-medium md:col-span-2">
          Notas
          <textarea
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Observaciones de tolerancia, porcion o fase"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-4">
          <Button type="button" disabled>
            <Plus aria-hidden="true" />
            Guardar en base de conocimiento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
