# IMO Foods Backend

API REST inicial para IMO Meals, implementada con NestJS y TypeScript.

## Estado actual

El modulo `foods` expone un CRUD completo persistido en PostgreSQL mediante
Prisma. En desarrollo apunta a Supabase Dev usando `backend/.env.local`.

## Comandos

```powershell
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run vercel-build
npm run db:migrate -- --name nombre_migracion
npm run db:seed
npm run db:deploy
```

`db:migrate` se usa en desarrollo. `db:deploy` aplica migraciones ya creadas en
produccion. `vercel-build` ejecuta `db:deploy` y despues compila el backend.

## Variables de entorno

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

No subas `.env.local` al repositorio.

## Endpoints

```text
GET    /health
GET    /foods
GET    /foods?search=arroz
GET    /foods?status=allowed
GET    /foods?category=Proteina
GET    /foods?tag=proteina
GET    /foods/:id
POST   /foods
PATCH  /foods/:id
DELETE /foods/:id
```

## Ejemplo de payload

```json
{
  "name": "Merluza",
  "category": "Proteina",
  "status": "allowed",
  "tolerance": 4,
  "notes": "Mejor cocida o a la plancha.",
  "tags": ["proteina", "cena"]
}
```

## Persistencia

El esquema vive en `prisma/schema.prisma` y las migraciones en
`prisma/migrations`. Prisma Client se inyecta en Nest mediante
`src/prisma/prisma.service.ts`.
