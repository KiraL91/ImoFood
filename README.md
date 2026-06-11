# IMO Foods

Monorepo personal para IMO Meals.

## Estructura

```text
imo-foods/
|-- frontend/   # Next.js 15 + TypeScript + Tailwind
|-- backend/    # API NestJS + TypeScript
|-- docs/       # Notas de despliegue y arquitectura
`-- .github/    # Workflows de CI/CD
```

## Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

El frontend arranca normalmente en `http://localhost:3000`.

## Backend

```powershell
cd backend
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

El backend arranca en `http://localhost:4000` y expone el CRUD de alimentos en
`/foods`. La persistencia usa Prisma + PostgreSQL en Supabase.

Comandos de base de datos:

```powershell
cd backend
npm.cmd run db:migrate -- --name nombre_migracion
npm.cmd run db:seed
npm.cmd run db:deploy
```

## Conexion Frontend/Backend

Para que el frontend use el backend local, configura:

```text
frontend/.env.local
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

La seccion de alimentos usa TanStack Query para leer, crear, editar y borrar.
Si la variable queda vacia, muestra mocks y desactiva las acciones de escritura.

## Usuarios de prueba

El seed del backend crea usuarios locales para validar roles y permisos:

```text
owner / owner       control completo
member / member     lectura, creacion y edicion
readonly / readonly solo lectura
```

## CI/CD

Los workflows activos validan frontend y backend con:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Para despliegue automatico, importa este repositorio en Vercel y configura:

```text
Root Directory: frontend
Build Command: npm run build
Install Command: npm ci
```

Vercel se encargara del CD en cada push a `main`.
