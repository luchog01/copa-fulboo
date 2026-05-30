@AGENTS.md

# Copa Fulboo — Harness

Plataforma para registrar resultados de partidos de fútbol del grupo de amigos. El agente (Claude) es el dueño y responsable del producto.

## Stack
- **Next.js 16** (App Router, RSC, Server Actions) + TypeScript
- **Tailwind CSS** + **shadcn/ui** (`@base-ui/react` — sin prop `asChild`, usar `buttonVariants` para links)
- **Drizzle ORM** + `postgres` driver → Postgres local (`copa_fulboo` DB) / Neon en prod
- **Zod v4** — usar `.issues[0]` (no `.errors[0]`)
- **Vitest** (unit) + **Playwright** (E2E, dev server debe estar corriendo)

## Arquitectura en capas
```
src/db/           → schema, client (singleton), migrations, seed
src/domain/       → lógica pura sin I/O (stats.ts) — testear con Vitest
src/repositories/ → patrón repositorio sobre Drizzle (única capa de acceso a datos)
src/app/          → páginas (RSC) + Server Actions (validar con Zod + requireAuth)
src/components/   → UI (shadcn/ui + propios)
src/lib/auth.ts   → cookie httpOnly firmada; src/proxy.ts → protección de rutas
```

## Modelo de datos
- `players`: roster persistente (id, name, nickname, createdAt)
- `matches`: id, playedAt, format (5v5|8v8), homeScore, awayScore, notes
- `match_players`: matchId, playerId, team (home|away), isMvp — las estadísticas se **derivan**, no se almacenan

## Comandos clave
```bash
pnpm dev          # dev server (necesario para E2E)
pnpm build        # type-check + build prod
pnpm test         # Vitest (unit)
pnpm test:e2e     # Playwright E2E (requiere dev server activo)
pnpm db:generate  # drizzle-kit generate
pnpm db:migrate   # drizzle-kit migrate
pnpm db:seed      # poblar DB con datos de prueba
pnpm db:studio    # Drizzle Studio UI
```

## Auth
- `ADMIN_PASSWORD` en `.env.local` → cookie `admin_session=authenticated` (7 días, httpOnly)
- `requireAuth()` en Server Actions; `src/proxy.ts` bloquea rutas de escritura sin sesión
- Lectura siempre pública

## Variables de entorno
```
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo
ADMIN_PASSWORD=fulboo123
AUTH_SECRET=super-secret-dev-key-change-in-prod
```

## Skills disponibles
- `.claude/skills/db-migrate/` — generar y aplicar migraciones Drizzle
- `.claude/skills/run-e2e/` — correr tests E2E con Playwright
- `.claude/skills/run-app/` — levantar y verificar la app en dev

## Convenciones
- Páginas = Server Components; formularios = Client Components con `useActionState`
- Al agregar una feature: schema → migración → repositorio → domain (si hay lógica) → UI → test
- Una skill = una habilidad; mantener CLAUDE.md corto
- Deploy destino: Vercel + Neon (Fase 5, pendiente — requerirá credenciales del usuario)
