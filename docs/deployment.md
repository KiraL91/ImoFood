# Deployment

## GitHub

Desde la raiz del monorepo:

```powershell
cd "C:\Desarrollo\ImoFoods"
git status
git add .
git commit -m "Prepare IMO Foods monorepo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/imo-foods.git
git push -u origin main
```

## Vercel para frontend

1. Crear proyecto en Vercel desde GitHub.
2. Seleccionar el repositorio `imo-foods`.
3. Configurar:

```text
Root Directory: frontend
Install Command: npm ci
Build Command: npm run build
```

4. Variables de entorno:

```text
NEXT_PUBLIC_APP_NAME=IMO Meals
NEXT_PUBLIC_API_BASE_URL=
```

Cada push a `main` generara despliegue de produccion. Las ramas y pull requests
generaran previews automaticamente si Vercel Git Integration esta activado.

## Backend futuro

Cuando exista backend, se puede desplegar como segundo servicio desde la carpeta
`backend/` en Render, Railway, Fly.io, Cloudflare Workers u otra plataforma.
