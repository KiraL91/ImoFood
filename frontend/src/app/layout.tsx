import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "IMO Meals",
  title: {
    default: "IMO Meals",
    template: "%s | IMO Meals",
  },
  description: "Gestor de comidas, alimentos y recetas para IMO/SIBO.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "IMO Meals",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2f6f5e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
