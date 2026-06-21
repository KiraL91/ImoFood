# Clean Chat Bootstrap

Use this to start a new Codex chat with minimal pasted context:

```text
Trabaja en `C:\Desarrollo\ImoFoods`.
Lee primero `AGENTS.md` y despues el `AGENTS.md` del subproyecto que vayas a tocar (`frontend/AGENTS.md` o `backend/AGENTS.md`).
Responde en espanol.
Sigue las reglas del repo: cambios pequenos, validar antes de cerrar, y crear commit automaticamente despues de implementar cambios.
No leas ni muestres secretos de `.env.local` salvo que sea imprescindible.
```

## What The New Chat Should Know

- The app is called IMO Meals / IMO Foods.
- It is a private personal app for IMO/SIBO/IBD food, recipe, intake, symptom and treatment tracking.
- Frontend and backend are separate projects in one monorepo.
- Frontend talks to backend through `NEXT_PUBLIC_API_BASE_URL`.
- Backend uses Prisma/Postgres/Supabase and JWT auth.
- AI suggestions exist but must be user-triggered and reviewed before saving.

## Useful First Commands

```powershell
cd C:\Desarrollo\ImoFoods
git status --short
```

Frontend validation:

```powershell
cd C:\Desarrollo\ImoFoods\frontend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Backend validation:

```powershell
cd C:\Desarrollo\ImoFoods\backend
npm.cmd run lint
npm.cmd run build
```
