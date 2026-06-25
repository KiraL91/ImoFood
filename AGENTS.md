# IMO Foods Agent Context

Use this file as the compact project context for clean Codex chats.

## Working Directory

- Main repo: `C:\Desarrollo\ImoFoods`
- Monorepo layout:
  - `frontend/`: Next.js app for IMO Meals.
  - `backend/`: NestJS REST API.
  - `docs/`: deployment/context notes.
  - `.github/workflows/`: CI for frontend and backend.

## Product

IMO Meals is a private personal PWA-oriented web app for IMO/SIBO/IBD food tracking.
The app is private except for login.

Core domains already present:

- Foods: CRUD, statuses, tolerance, suggested serving, food detail, AI food info suggestions on demand.
- Recipes: CRUD, rating 1-5, searchable by rating/ingredients, steps visible from cards.
- Meal ideas: local suggestions and AI suggestions from selected safe/reasonable foods.
- Meal logs: food/recipe intake tracking, date filters, links to symptoms.
- Symptom logs: tracking values 0-10, can relate to meal logs.
- Treatments: active treatments and intake logs.
- Dashboard: "Hoy" daily view with follow-up actions.
- Settings: own profile, owner-only user administration and future integrations.

## Stack

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style local UI, TanStack Query, Zod, Lucide.
- Backend: NestJS 11, TypeScript, Prisma 6, PostgreSQL on Supabase, class-validator.
- AI: backend provider abstraction, currently Gemini-compatible config via env.
- Auth: simple username/password auth with roles `owner`, `member`, `readonly` and permissions per endpoint.

## Repo Rules

- Respond in Spanish unless the user asks otherwise.
- Prefer small, focused changes.
- Preserve current visual style and mobile-first UX.
- Do not read or print secrets from `.env.local` unless strictly necessary. Never expose secret values.
- Keep frontend/back contracts aligned without adding a shared package unless explicitly requested.
- Use existing patterns: feature folders, API files, query hooks, modal forms, floating create buttons, local UI components.
- After implementing a user-requested code change, run relevant validation and create a git commit automatically.
- Do not push unless the user asks.

## Context Hygiene

- Default to token economy mode when the user does not request otherwise.
- Minimize internal context: read the nearest relevant `AGENTS.md` files first, then only the files directly involved in the task.
- Prefer targeted `rg` searches and focused file reads over broad repository scans.
- If the scope is unclear, separate exploration from implementation and ask for/offer a short plan before reading large areas.
- Keep intermediate updates brief; summarize large command outputs instead of pasting them back.
- Validate proportionally to the change. Run full frontend/backend validation for code changes in that area, but skip builds for tiny text-only documentation changes and say so.
- Add more specific `AGENTS.md` files only for high-risk or cross-contract areas such as auth, Prisma/data ownership, AI, or complex feature flows.
- When a task introduces durable project context, new repo rules, or repeatedly applied conventions, update the nearest relevant `AGENTS.md` automatically in the same change.
- If a task appears large, first identify the smallest useful slice and the likely files to touch before doing broad exploration.
- When the user names a layer, route, file, or feature, stay within that scope unless a contract break requires crossing boundaries.
- Keep final summaries short by default: what changed, validation run, commit hash, and any real caveats.

## Validation

Frontend:

```powershell
cd C:\Desarrollo\ImoFoods\frontend
npm.cmd run format
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Backend:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run format
npm.cmd run lint
npm.cmd run build
```

Database:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run db:migrate -- --name nombre_migracion
npm.cmd run db:deploy
npm.cmd run db:seed
```

## Local Runtime

Frontend:

```powershell
cd C:\Desarrollo\ImoFoods\frontend
npm.cmd run dev
```

Backend:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run dev
```

Typical URLs:

- Frontend: `http://localhost:3000` or another free Next port.
- Backend: `http://localhost:4000`.
- Health: `/health`.

## Env Notes

Frontend:

- `NEXT_PUBLIC_API_BASE_URL` points to backend.
- If unset, backend-backed screens stay empty/disabled and show configuration guidance.

Backend:

- `DATABASE_URL` and `DIRECT_URL` point to Supabase/Postgres.
- `JWT_SECRET` required for auth.
- `CORS_ORIGIN` should include frontend URL.
- AI vars: `AI_ENABLED`, `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` or `GEMINI_API_KEY`, optional `AI_BASE_URL`, `AI_TEMPERATURE`, `AI_TIMEOUT_MS`, `AI_MAX_OUTPUT_TOKENS`.

Do not commit real `.env.local` values.

## Deployment

- GitHub repo: `KiraL91/ImoFood`.
- Vercel has separate frontend and backend projects.
- Frontend root directory: `frontend`.
- Backend root directory: `backend`.
- Backend Vercel build should use `npm run vercel-build` if migrations must deploy automatically.
- CI workflows validate frontend and backend on GitHub.

## Test Users

Seed creates:

- `owner` / `owner`
- `member` / `member`
- `readonly` / `readonly`

Use these only for local/test data.

## More Context

Read these before touching specific areas:

- `frontend/AGENTS.md` for frontend architecture and UX rules.
- `backend/AGENTS.md` for API, Prisma, auth, AI and migrations.
- `docs/clean-chat-context.md` for a short prompt to start a fresh chat.
