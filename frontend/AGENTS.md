# Frontend Agent Context

Frontend app for IMO Meals.

## Location

`C:\Desarrollo\ImoFoods\frontend`

## Stack

- Next.js 15 App Router.
- React 19.
- TypeScript strict.
- Tailwind CSS.
- Local shadcn-style UI in `src/components/ui`.
- TanStack Query for API state.
- Zod for runtime response validation.
- Lucide React icons.

## Key Structure

- `src/app`: routes.
- `src/components`: reusable visual components.
- `src/features`: feature-level API/query/state/UI orchestration.
- `src/lib/api/client.ts`: authenticated API client and token expiry handling.
- `src/lib/types`: frontend contracts.
- `src/providers/auth-provider.tsx`: auth session and permission checks.
- `src/providers/query-provider.tsx`: TanStack Query provider.

Important feature files:

- Dashboard: `src/features/dashboard/today-dashboard.tsx`.
- Foods: `src/features/foods/*`, `src/components/foods/*`.
- Recipes: `src/features/recipes/*`, `src/components/recipes/*`.
- Meal ideas: `src/features/meal-ideas/*`.
- Meal logs: `src/features/meal-logs/*`, `src/components/meal-logs/*`.
- Symptoms: `src/features/symptoms/*`, `src/components/symptoms/*`.
- Treatments: `src/features/treatments/*`, `src/components/treatments/*`.
- Navigation: `src/lib/constants/navigation.ts`, `src/components/layout/*`.

## Routes

- `/login`: public.
- `/`: private dashboard/"Hoy".
- `/foods`: private foods.
- `/recipes`: private recipes.
- `/meal-ideas`: private suggestions.
- `/meal-logs`: private intake log / "Mi diario".
- `/symptoms`: private symptom log.
- `/treatments`: private treatments.
- `/settings`: private settings.

## Frontend Patterns

- Data access lives in `features/<domain>/<domain>-api.ts`.
- TanStack hooks live in `features/<domain>/<domain>-queries.ts`.
- API responses should be parsed with Zod where practical.
- UI components receive callbacks/data; feature files own mutations and routing.
- Create/edit forms usually live in modal dialogs.
- Floating create buttons must sit above mobile bottom navigation:
  `bottom-[calc(9.5rem+env(safe-area-inset-bottom))]` on mobile, `sm:bottom-6` on larger screens.
- Keep forms low-friction. Prefer optional fields and sensible defaults.
- Do not save AI output automatically; AI suggestions populate editable drafts only.

## Current UX Decisions

- Mobile navigation is grouped by user mental model, including "Mi diario".
- Dashboard is a daily "Hoy" overview with direct actions.
- Foods cards are compact; full details are in `FoodDetailDialog`.
- Recipe cards show prep time, ingredient count, rating, ingredients and accessible steps.
- Meal ideas support:
  - local non-AI suggestions.
  - AI suggestions with selected food IDs.
  - saving AI suggestions as recipes.
- Food creation supports on-demand AI fill:
  - user enters name.
  - user presses `Sugerir con IA`.
  - backend returns category/status/tolerance/serving/notes/tags.
  - fields remain editable before saving.

## Auth and Permissions

- Use `useAuth()` for `isAuthenticated`, `hasPermission`, current user.
- Private app shell should redirect expired/invalid token flows to `/login`.
- Keep permission strings aligned with backend `auth.constants.ts`.

Relevant permissions include:

- `foods:*`
- `recipes:*`
- `meal-logs:*`
- `symptom-logs:*`
- `treatments:*`
- `treatment-logs:*`
- `ai-suggestions:read`
- `ai-suggestions:create`

## API Client

- Use `apiClient` from `src/lib/api/client.ts`.
- Do not hand-roll auth headers in feature files.
- If backend returns unauthorized due to token expiry, user should return to login.

## Validation

Run after frontend changes:

```powershell
cd C:\Desarrollo\ImoFoods\frontend
npm.cmd run format
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

For tiny text-only doc changes, frontend build is not required.
