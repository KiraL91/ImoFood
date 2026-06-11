# IMO Meals

PWA-ready frontend para gestionar alimentos, recetas e ideas de comida relacionadas con IMO/SIBO. La seccion de alimentos ya puede consumir el backend REST local; el resto de secciones siguen usando mocks.

## Stack

- Next.js 15 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui local
- TanStack Query
- Zod
- Lucide React
- ESLint y Prettier

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run format
```

El servidor local arranca por defecto en `http://localhost:3000`.

## Variables de entorno

Copia `.env.example` a `.env.local` para activar el backend local.

```bash
NEXT_PUBLIC_APP_NAME="IMO Meals"
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

Si `NEXT_PUBLIC_API_BASE_URL` queda vacia, alimentos usa mocks y desactiva las acciones de escritura.

## Estructura

```text
src/
  app/                 Rutas del App Router
  components/          UI reutilizable y layout
  features/            Logica de pantalla por dominio
  lib/                 API client, constantes, mocks, tipos y utilidades
  hooks/               Hooks compartidos futuros
  providers/           Providers globales
  styles/              Estilos compartidos futuros
```

## Decisiones iniciales

- Los tipos de dominio viven en `src/lib/types` y se validan con Zod.
- Los mocks viven en `src/lib/mock`; alimentos ya usa TanStack Query con fallback a mock si no hay API configurada.
- TanStack Query ya envuelve la app desde `src/providers/query-provider.tsx`.
- El cliente API esta centralizado en `src/lib/api/client.ts`.
- La navegacion esta en `src/lib/constants/navigation.ts`.
- shadcn/ui se implementa como componentes locales en `src/components/ui`.
- La app incluye manifest PWA, pero no registra service worker todavia.
