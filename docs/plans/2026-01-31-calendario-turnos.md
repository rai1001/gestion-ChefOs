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
1. Funciones para generar días de mes (primer día, padding) y agrupar eventos/turnos por fecha.
2. Helper `labelShift(status, code)` para color/texto.
3. Vitest para utils (stub data).

### Task 2: API filtors para calendario
**Files:**
- Modify: `src/app/api/events/route.ts` (si no acepta rango)
- Modify: `src/app/api/shifts/route.ts` (añadir filtro hotel_id)

**Steps:**
1. Aceptar query `from`/`to` en GET events para limitar fechas.
2. Aceptar `hotel_id` en GET shifts y mantener stub.
3. Ajustar tests existentes si aplica.

### Task 3: UI Calendario mensual
**Files:**
- Add: `src/app/(app)/calendar/month/page.tsx`
- Possibly add component `src/app/(app)/calendar/MonthGrid.tsx`
- Tests: `tests/e2e/calendar-month.spec.ts`

**Steps:**
1. Grid 7x6, encabezados lun-dom; cada celda muestra fecha, eventos (nombre/pax) y turnos (mañana/tarde) truncados; contador “+N” para overflow.
2. Toolbar: selector de mes (prev/next), toggle salón/hotel (select), leyenda de colores (evento, turno mañana, turno tarde, vacaciones).
3. Datos: fetch `/api/events?from=...&to=...` y `/api/shifts?start=...&end=...`.
4. E2E: verifica que se renderiza el mes y marca un evento stub.

### Task 4: UI Calendario semanal (agenda empleados)
**Files:**
- Add: `src/app/(app)/calendar/week/page.tsx`
- Tests: `tests/e2e/calendar-week.spec.ts`

**Steps:**
1. Layout filas=empleados (de `/api/employees`), columnas=días (7); cada celda muestra turno mañana/tarde o “V” vacaciones; click para crear turno rápido (stub, POST /api/shifts).
2. Filtros: hotel selector y semana (date input start).
3. Leyenda de colores y contador de faltantes.
4. E2E: crea turno vía UI y lo ve en la cuadrícula (stub).

### Task 5: Navegación
**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Tests: `tests/e2e/smoke.spec.ts` (añadir rutas)

**Steps:**
1. Añadir links “Calendario mes” y “Calendario semana” en nav.
2. Smoke: visita /calendar/month y /calendar/week.

### Task 6: Documentación
**Files:**
- Update: `docs/api-contracts.md` (query params from/to hotel_id)
- Update: `docs/plans/2026-01-31-calendario-turnos.md` (mark done)

**Steps:**
1. Documentar filtros y payloads.

### Task 7: Tests finales y commit
**Steps:**
1. `pnpm test` (vitest).
2. `pnpm e2e --project=chromium --grep "calendar"` + smoke si aplica.
3. Commit `feat(calendar): month+week views`.

---

Listo para ejecutar con @test-driven-development y @vercel-react-best-practices.
