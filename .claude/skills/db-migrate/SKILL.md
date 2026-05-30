---
description: Generate and apply Drizzle ORM migrations for Copa Fulboo
---

# Skill: db-migrate

Genera y aplica migraciones de base de datos usando Drizzle Kit.

## Cuándo usar
- Al modificar `src/db/schema.ts` (agregar tabla, columna, enum, etc.)
- Para sincronizar el schema local con la DB de desarrollo

## Pasos

1. Modificar `src/db/schema.ts` con los cambios deseados

2. Generar la migración:
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo pnpm db:generate
```
Esto crea un nuevo archivo SQL en `src/db/migrations/`.

3. Aplicar la migración:
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo pnpm db:migrate
```

4. Verificar con `pnpm db:studio` si se necesita inspección visual.

## Notas
- El driver es `postgres` (postgres.js), no `pg`
- En prod (Neon), la `DATABASE_URL` tiene la forma `postgresql://user:pass@host/db?sslmode=require`
- Nunca editar los archivos SQL generados manualmente
- Si hay conflicto de migración, usar `drizzle-kit drop` para revertir
