import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PreferenceCardProps = {
  title: string;
  description: string;
  value: unknown;
};

function formatValue(value: unknown) {
  if (typeof value === "boolean") {
    return value ? "Activado" : "Desactivado";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  return "Configurado";
}

export function PreferenceCard({ title, description, value }: PreferenceCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <Badge key={String(item)} variant="secondary">
                {String(item)}
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant={typeof value === "boolean" && value ? "default" : "outline"}>
            {formatValue(value)}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
