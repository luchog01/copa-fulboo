---
description: Run Playwright E2E tests for Copa Fulboo
---

# Skill: run-e2e

Ejecuta los tests end-to-end con Playwright contra el dev server.

## Prerequisito
El dev server debe estar corriendo en http://localhost:3000:
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo pnpm dev
```

## Correr todos los tests
```bash
DATABASE_URL=postgresql://postgres@localhost:5432/copa_fulboo pnpm test:e2e
```

## Correr un test específico
```bash
pnpm exec playwright test e2e/copa-fulboo.spec.ts --grep "login"
```

## Ver reporte HTML
```bash
pnpm exec playwright show-report
```

## Dónde están los tests
- `e2e/copa-fulboo.spec.ts` — flujos principales (home, jugadores, partidos, login, crear partido)

## Al agregar features
Agregar casos en `e2e/copa-fulboo.spec.ts` cubriendo:
- Vista pública de la nueva sección
- Flujo de escritura (si tiene mutación): login → acción → verificar resultado

## Notas
- Los tests modifican la DB (crean partidos reales). Considerar seed limpio si se corre en CI.
- `playwright.config.ts` no levanta dev server automáticamente — hacerlo manualmente antes.
