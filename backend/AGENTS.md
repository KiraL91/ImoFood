# Backend Agent Context

NestJS API for IMO Meals.

## Location

`C:\Desarrollo\ImoFoods\backend`

## Stack

- NestJS 11.
- TypeScript.
- Prisma 6.
- PostgreSQL/Supabase.
- class-validator DTOs.
- Simple JWT auth and role/permission guards.

## Key Structure

- `src/main.ts`: app bootstrap, CORS, validation pipes.
- `src/app.controller.ts`: health/root endpoints.
- `src/prisma`: Prisma module/service.
- `src/auth`: login, guards, permissions, role mapping.
- `src/foods`: Food CRUD.
- `src/recipes`: Recipe CRUD.
- `src/meal-logs`: intake logs.
- `src/symptom-logs`: symptom logs.
- `src/treatments`: treatments and treatment logs.
- `src/users`: owner-only user administration.
- `src/ai`: provider abstraction and suggestion endpoints.
- `prisma/schema.prisma`: database schema.
- `prisma/migrations`: committed migrations.
- `prisma/seed.mjs`: local/test users only; no demo domain data.

## API Domains

Auth:

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/roles`
- Uses seeded users for local/test: `owner`, `member`, `readonly`.
- Fresh databases should start with empty foods, recipes, logs, symptoms, and treatments.

Health:

- `GET /health`

Foods:

- CRUD under `/foods`.
- Includes `suggestedServing`.
- Food statuses: `allowed`, `testing`, `caution`, `avoid`.
- Tolerance: integer 1-5.

Recipes:

- CRUD under `/recipes`.
- Includes ingredients, steps, tags, prep time, rating.
- Personal per authenticated user; always scope read/update/delete by `userId`.

Meal logs:

- CRUD under `/meal-logs`.
- Can link recipes and concrete foods.
- Linked recipes must belong to the same user; foods remain shared catalog records.
- Personal per authenticated user; always scope read/update/delete by `userId`.

Symptom logs:

- CRUD under `/symptom-logs`.
- Can link to meal logs.
- Personal per authenticated user; linked meal logs must belong to the same user.

Treatments:

- CRUD under `/treatments`.
- Treatment logs under treatment log controller/service.
- Treatments and treatment logs are personal per authenticated user.
- Treatment log linked treatment, meal log, and symptom log records must belong to the same user.

AI:

- `GET /ai/suggestions/config`
- `POST /ai/suggestions/meal-ideas`
- `POST /ai/suggestions/food-info`
- Protected by auth and `ai-suggestions:*` permissions.
- Meal ideas may read shared foods, but recipe context must be scoped to the authenticated user.

Users:

- CRUD-style admin lives under `/users`.
- User admin is owner-only through `users:*` permissions.
- Never return `passwordHash` from any user endpoint.
- Disabled users use `AppUser.active = false`; do not physically delete users.
- Reactivation uses `PATCH /users/:id/enable` and keeps the same user record.
- Owner password reset uses `PATCH /users/:id/password` and must not require the user's current password.
- User audit is minimal last-action metadata on `AppUser`: `lastDisabled*`, `lastEnabled*`, and `passwordReset*`; it is not a full append-only audit log.
- Auth must reject inactive users on login and authenticated requests.
- Always preserve at least one active owner when changing roles or disabling users.
- Usernames are 3-50 characters and match `[a-z0-9_-]`; reject invalid create input and store them lowercase.

## Context Hygiene

- For backend feature changes, start with the affected controller, service, DTOs, type mapper, and tests/seed only when relevant.
- Read `src/auth/auth.constants.ts` only when changing endpoint permissions, roles, or frontend permission contracts.
- Read `prisma/schema.prisma` and migrations only when the data shape or ownership model changes.
- Prefer targeted `rg` searches for endpoint paths, DTO names, Prisma models, and permission strings before broad scans.
- Keep validation scoped: run backend format/lint/build for backend code changes; add `db:generate`, migrations, deploy, or seed only when schema, Prisma client, or seed data changes.
- For tiny text-only documentation edits, backend build is not required; state that explicitly.

## Auth and Permissions

- Permission list and role mapping: `src/auth/auth.constants.ts`.
- Guards:
  - `AuthGuard` authenticates.
  - `PermissionsGuard` authorizes.
- Session refresh uses `POST /auth/refresh` with the current bearer token and returns a renewed access token plus fresh user permissions.
- Role catalog uses `GET /auth/roles`, requires `users:read`, and reflects the fixed system roles plus their current permissions.
- Keep frontend `src/lib/types/auth.ts` aligned when permissions change.

Roles:

- `owner`: full permissions.
- `member`: read/create/update for most personal data and AI suggestions.
- `readonly`: read-only.

User management:

- Only `owner` should receive `users:*` permissions.
- Keep frontend `src/lib/types/auth.ts` aligned with backend permission changes.
- Keep user DTOs explicit and avoid exposing password hashes through select/include shortcuts.
- Keep username validation aligned with `src/users/user.constants.ts`.

## Prisma and Database

- Change DB shape through Prisma schema and migrations.
- For local/dev migration:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run db:migrate -- --name nombre_migracion
```

- For production migration:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run db:deploy
```

- Seed:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run db:seed
```

The seed only upserts local/test users. It must not insert demo foods, recipes, logs, symptoms, treatments, or treatment logs unless explicitly requested.

Do not rely on app startup to mutate schema automatically.

## Supabase Notes

- Supabase is managed Postgres plus optional services.
- Local development may point to dev Supabase because Docker Desktop is not available.
- Production should point to the production Supabase project via Vercel env vars.
- Use encoded DB passwords in connection strings when they contain reserved URL chars like `/`.
- For Prisma with Supabase pooler, prepared statement issues may require correct connection mode/config. Be careful with transaction/session pooler behavior.

## AI Architecture

- Provider interface: `src/ai/types/ai-model.ts`.
- Gemini provider: `src/ai/providers/gemini-ai-model.provider.ts`.
- Placeholder provider exists for disabled mode.
- Config: `src/ai/ai-model-config.service.ts`.
- Do not call AI directly from controllers; use `AiSuggestionsService`.
- Require JSON response schemas where possible.
- Validate AI responses before returning them to frontend.
- AI output should be treated as suggestions, never authoritative medical advice.

Current AI capabilities:

- Meal ideas based on selected safe/reasonable foods.
- Food info suggestion on demand for new food forms.

## Validation

Run after backend changes:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run format
npm.cmd run lint
npm.cmd run build
```

Run backend tests when touching auth, permissions, or user management:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run test
```

Backend tests use Node's built-in test runner. Specs live beside source as `*.spec.ts` and compile through `tsconfig.test.json` into `dist-test`.

When schema or seeds change, also consider:

```powershell
npm.cmd run db:generate
npm.cmd run db:seed
```

## Deployment

- Backend deployed as a separate Vercel project rooted at `backend`.
- If automatic migrations are desired on deploy, Vercel Build Command should be:

```text
npm run vercel-build
```

This runs `prisma migrate deploy` before `npm run build`.

Ensure production env vars exist in the backend Vercel project.
