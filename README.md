# IMO Foods

Monorepo personal para IMO Meals.

## Estructura

```text
imo-foods/
├── frontend/   # Next.js 15 + TypeScript + Tailwind
├── backend/    # Scaffold reservado para la API futura
├── docs/       # Notas de despliegue y arquitectura
└── .github/    # Workflows de CI/CD
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

## Backend

La carpeta `backend/` queda preparada para crear la API cuando se decida el stack.
De momento solo contiene estructura base y no ejecuta servicios.

## CI/CD

El workflow activo valida el frontend con:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Para despliegue automático, importa este repositorio en Vercel y configura:

```text
Root Directory: frontend
Build Command: npm run build
Install Command: npm ci
```

Vercel se encargara del CD en cada push a `main`.
