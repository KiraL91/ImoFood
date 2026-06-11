# IMO Foods Backend

API REST inicial para IMO Meals, implementada con NestJS y TypeScript.

## Estado actual

El modulo `foods` ya expone un CRUD completo con datos en memoria. Reiniciar el
servidor restaura los datos mock iniciales.

## Comandos

```powershell
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

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

## Persistencia futura

La persistencia se conectara en `src/foods/foods.service.ts`, sustituyendo el
`Map` en memoria por un repositorio o cliente de base de datos sin cambiar el
contrato HTTP del controlador.
