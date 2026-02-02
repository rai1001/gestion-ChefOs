# Dashboards Home Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor /dashboards to be the principal home with 4 KPI tarjetas (Alertas, Tareas 7d, Previsión desayunos 7d, Caducidades próximas) and lists below (alertas, eventos próximos, caducidades, tareas próximas) usando los endpoints reales (/api/alerts, /api/tasks, /api/dashboards/events/upcoming, /api/forecasts/*).

**Architecture:** Reuse existing dashboards queries helper; add fetchers for tasks (rango 7d), alerts detail y caducidades; compose client page with a 2x2 card grid and list sections. Keep E2E stub mode working (NEXT_PUBLIC_E2E=1) via in-memory stores.

**Tech Stack:** Next.js App Router (client page), Supabase fetch via REST helpers, Playwright e2e, Vitest unit tests.

---

### Task 1: Datos de dashboard (queries)

**Files:**
- Modify: `src/lib/dashboards/queries.ts`
- Tests: `tests/lib/dashboards/queries.test.ts`

**Steps:**
1. Añadir funciones `getUpcomingTasks(org_id, daysAhead=7)` y `getAlerts(org_id)` usando `/api/tasks?from=...&to=...` y `/api/alerts` (en E2E usar stores existentes).
2. Añadir `getBreakfastForecast(org_id, daysAhead=7)` reutilizando supabase view o fallback stub (usar forecast_delta o real + forecast; mostrar total desayunos esperados en 7d).
3. Exportar tipos para alert list y task list.
4. Actualizar pruebas de queries en Vitest para stub mode: verificar que retorna arrays con longitud >0 usando store seeds.
5. Run `pnpm test` (o target queries file) y fijar fallos.

Estado: ✅ completado (tests verdes `corepack pnpm test -- tests/lib/dashboards/queries.test.ts`).

### Task 2: UI /dashboards

**Files:**
- Modify: `src/app/(app)/dashboards/page.tsx`

**Steps:**
1. Reestructurar header a “Dashboard operativo”.
2. Construir grid 2x2 de tarjetas: Alertas (cuenta), Tareas 7d (pendientes/in progress), Previsión desayunos 7d (suma prevista vs real si disponible), Caducidades próximas (<=7d).
3. Debajo, listas:
   - Alertas recientes (usar `getAlerts`),
   - Próximos eventos (usar `getUpcomingEvents` ya existente, ahora 7d),
   - Caducidades próximas (usar `getExpirySoon` con 7d),
   - Tareas próximas (usar `getUpcomingTasks`).
4. Añadir data-testid para cards: `card-alerts`, `card-tasks`, `card-forecast`, `card-expiry` y listas `list-alerts`, `list-events`, `list-expiry`, `list-tasks`.
5. Manejar estados vacíos y errores de fetch (fallback a arrays vacíos).
6. Mantener estilos oscuros existentes.

### Task 3: E2E dashboard

**Files:**
- Modify: `tests/e2e/dashboards.spec.ts`

**Steps:**
1. Actualizar test para verificar las 4 tarjetas y que las listas muestran al menos un item (stub E2E) o “Sin datos” si vacío.
2. Ejecutar `pnpm e2e --project=chromium --grep dashboards` y asegurar verde.

### Task 4: Documentación

**Files:**
- Update: `docs/plans/2026-01-31-dashboards-home.md` (este mismo, mark done), opcional nota en `docs/api-contracts.md` si cambia shape de datos (no previsto).

**Steps:**
1. Marcar completado en este plan tras ejecución.
2. Si se tocó contract, documentar endpoint en api-contracts.

### Task 5: Commit & Push

**Files:** n/a

**Steps:**
1. `git status` revisar.
2. `git add ...` y `git commit -m "feat(dashboards): home cards and lists"`.
3. `git push`.

---

Ready to execute tasks siguiendo @test-driven-development y @vercel-react-best-practices si aplica.
