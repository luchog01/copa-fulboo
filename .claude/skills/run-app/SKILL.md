---
description: Start and verify the Copa Fulboo dev app
---

# Skill: run-app

Levanta el servidor de desarrollo y verifica que la app funcione.

## Iniciar dev server
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo pnpm dev
```
Corre en http://localhost:3000

## Verificar que levantó
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Debe responder 200
```

## Prerequisitos
- Postgres local corriendo en puerto 5432
- DB `copa_fulboo` creada (`psql -U postgres -c "CREATE DATABASE copa_fulboo;"`)
- `.env.local` con `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`
- Migraciones aplicadas (`pnpm db:migrate`)
- (Opcional) seed cargado (`pnpm db:seed`)

## Rutas principales
| Ruta | Descripción | Auth |
|------|------------|------|
| `/` | Dashboard | Pública |
| `/partidos` | Historial | Pública |
| `/partidos/[id]` | Detalle partido | Pública |
| `/jugadores` | Tabla de stats | Pública |
| `/partidos/nuevo` | Crear partido | Admin |
| `/jugadores/nuevo` | Agregar jugador | Admin |
| `/login` | Login admin | — |

## Credenciales dev
- Admin password: `fulboo123` (en `.env.local`)

## Notas
- Cambios en `src/db/schema.ts` requieren migración antes de reiniciar
- El singleton del cliente DB evita connection exhaustion en hot reload
