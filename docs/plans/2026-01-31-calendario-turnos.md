# Calendario mensual + semanal (turnos) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Añadir vista calendario mensual con eventos/turnos por día y vista semanal por empleado (líneas) mostrando mañana/tarde, vacaciones y bajas; permitir filtrar por salón/hotel/empleado y crear turno/evento rápido.

**Architecture:** Frontend client pages `/calendar/month` y `/calendar/week`; reutilizar datos de `events` y `shifts` APIs con filtros. E2E/stub mode debe renderizar datos locales. Sincronizar con Supabase cuando exista. Mantener App Router y estilos actuales.

**Tech Stack:** Next.js App Router, React client components, existing API routes (`/api/events`, `/api/shifts`), Playwright e2e, Vitest for helpers.

---

### Task 1: Helpers y adapters
**Files:**
- Add: `src/lib/calendar/utils.ts`
- Tests: `tests/lib/calendar/utils.test.ts`

**Steps:**
1. Escribir tests Vitest (fallando) para:
   - `buildMonthGrid(year, month)` devuelve 42 celdas (7x6) empezando en lunes, cada celda con `date`, `isCurrentMonth`.
   - `groupByDate(events|shifts)` agrupa por `yyyy-mm-dd`.
   - `labelShift(status, code)` devuelve `{label,color}` para mañana/tarde/vacaciones/baja.
   Run: `pnpm test --filter "calendar utils"` → debe fallar.
2. Implementar helpers en `src/lib/calendar/utils.ts` sin librerías externas: funciones de fecha puras que reciban `Date | string`.
3. Re-ejecutar `pnpm test --filter "calendar utils"` y asegurar verde.

### Task 2: API filtors para calendario
**Files:**
- Modify: `src/app/api/events/route.ts` (si no acepta rango)
- Modify: `src/app/api/shifts/route.ts` (añadir filtro hotel_id)

**Steps:**
1. Extender GET `/api/events` para aceptar `from`/`to` (ISO dates) y filtrar; en modo stub limitar a ese rango.
2. Extender GET `/api/shifts` para `hotel_id`, `start`, `end`; mantener stub con seeds filtrados.
3. Añadir/ajustar pruebas unitarias si existen; en caso contrario, cubrir con Vitest ligero o rely en e2e.
4. Run: `pnpm test --filter "api"`, revisar que no se rompan rutas.

### Task 3: UI Calendario mensual
**Files:**
- Add: `src/app/(app)/calendar/month/page.tsx`
- Possibly add component `src/app/(app)/calendar/MonthGrid.tsx`
- Tests: `tests/e2e/calendar-month.spec.ts`

**Steps:**
1. Crear Client Component con toolbar (prev/next mes, select hotel/salón, leyenda) y estado local `currentMonth`, `selectedHotel`.
2. Usar helpers para construir grid 7x6; cada celda muestra fecha, chips de eventos/turnos truncados y contador “+N” cuando >3 items; `data-testid="calendar-month-grid"`.
3. Fetch paralelo a `/api/events?from=...&to=...` y `/api/shifts?start=...&end=...`; fallback a arrays vacíos; spinners y estados vacíos.
4. E2E `tests/e2e/calendar-month.spec.ts`: visitar /calendar/month con `NEXT_PUBLIC_E2E=1`, verificar un evento stub visible y que prev/next cambian el mes; Run: `pnpm e2e --project=chromium --grep "calendar-month"`.

### Task 4: UI Calendario semanal (agenda empleados)
**Files:**
- Add: `src/app/(app)/calendar/week/page.tsx`
- Tests: `tests/e2e/calendar-week.spec.ts`

**Steps:**
1. Crear Client Component con filtros: hotel selector, input semana (start date), leyenda; cargar empleados de `/api/employees`.
2. Construir matriz empleados x 7 días; cada celda muestra mañana/tarde o “V”; botón inline “+” abre form ligero (modal o inline) para crear turno (POST /api/shifts) y refrescar.
3. Añadir contadores de faltantes por día y data-testid `calendar-week-grid`.
4. E2E `tests/e2e/calendar-week.spec.ts`: crea turno stub vía UI y verifica render; Run: `pnpm e2e --project=chromium --grep "calendar-week"`.

### Task 5: Navegación
**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Tests: `tests/e2e/smoke.spec.ts` (añadir rutas)

**Steps:**
1. Verificar que el sidenav y mobile nav incluyen “Calendario mes” y “Calendario semana”; añadir si falta, sin duplicados.
2. Actualizar smoke test para visitar /calendar/month y /calendar/week y ver headers básicos.
3. Run: `pnpm e2e --project=chromium --grep "smoke"` (o test específico actualizado).

### Task 6: Documentación
**Files:**
- Update: `docs/api-contracts.md` (query params from/to hotel_id)
- Update: `docs/plans/2026-01-31-calendario-turnos.md` (mark done)

**Steps:**
1. Documentar contratos de `/api/events` y `/api/shifts` con nuevos filtros y ejemplos.
2. Anotar en este plan qué tareas quedaron completadas.

### Task 7: Tests finales y commit
**Steps:**
1. `pnpm test` (vitest general).
2. `pnpm e2e --project=chromium --grep "calendar"` y smoke.
3. `git status`, `git add ...`, `git commit -m "feat(calendar): month+week views"`.

---

Estado al 2026-01-31:
- [x] Task 1 (utils + tests)
- [x] Task 2 (filtros events/shifts)
- [x] Task 3 (UI month + e2e)
- [x] Task 4 (UI week + e2e)
- [x] Task 5 (nav links)
- [x] Task 6 (api-contracts actualizado)
- [x] Task 7 (tests finales) – `pnpm test`, `pnpm e2e --project=chromium --grep "calendar"` OK; commit pendiente

---

Listo para ejecutar con @test-driven-development y @vercel-react-best-practices.
