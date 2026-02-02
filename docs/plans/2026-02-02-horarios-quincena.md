# Horarios Quincena (doble vista) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Añadir vista de cuadrante quincenal (dos quincenas apiladas) tipo grid: columnas = días (1-15 y 16-30), filas = empleados; cada celda muestra turno (M/V/T/N etc). Los días con eventos se marcan en el header. Debe consumir `/api/shifts` y `/api/events` en modo stub/E2E. Ruta propuesta: `/calendar/biweek`.

**Architecture:** Client component en App Router. Helper para generar dos quincenas contiguas a partir de una fecha de inicio (por defecto hoy). Fetch paralelo de shifts y events (rango 30 días). Mapeo shifts→celdas por empleado+fecha. Header marca eventos (badge) y muestra día+nombre abreviado. Diseño oscuro similar screenshot, con badges coloreados por turno.

**Tech Stack:** Next.js App Router client page, Tailwind utilities ya presentes, existing API routes `/api/shifts`, `/api/events`. Vitest para helpers, Playwright e2e.

---

### Task 1: Helpers de rango y mapping
**Files:**
- Add: `src/lib/calendar/biweek.ts`
- Tests: `tests/lib/calendar/biweek.test.ts`

**Steps:**
1. Función `buildBiweek(start: Date)` → `{ quincena1: Day[], quincena2: Day[], rangeStart, rangeEnd }` (15 días cada una, lunes a domingo se mantiene orden natural). Day = { date, dayLabel, dow, hasEvent?: bool }.
2. Helper `mapShiftsByEmployee(shifts)` → Record<employee_name, Record<date, shift_code>>.
3. Tests: verifica longitudes (15 cada), range of dates, mapping de shifts.

### Task 2: API fetch hook
**Files:**
- Add: `src/lib/calendar/useBiweekData.ts`
- Tests: (optional) `tests/lib/calendar/useBiweekData.test.ts` with mocked fetch (light)

**Steps:**
1. Hook client que recibe startDate y hotel_id opcional; hace fetch a `/api/events?from=...&to=...` y `/api/shifts?start=...&end=...`.
2. Devuelve `eventsByDate`, `shiftsByEmployee`, `loading`, `error`.
3. Tests: mock fetch con MSW? (omitir si costoso); mínimo: función pura separada para mapear eventos `groupByDate`.

### Task 3: UI /calendar/biweek
**Files:**
- Add: `src/app/(app)/calendar/biweek/page.tsx`
- Add: `src/app/(app)/calendar/biweek/BiweekGrid.tsx` (opcional)
- Tests e2e: `tests/e2e/calendar-biweek.spec.ts`

**Steps:**
1. Toolbar: selector de fecha inicio (date input), toggle hotel, leyenda de turnos, botón “Hoy”.
2. Grid: 2 bloques uno bajo otro, cada uno 15 columnas; header con día (número + dow abreviado) y chip si hay evento. Filas: empleado (name, role) + celdas con badge turno (M mañana, T tarde, N noche, V vacaciones). Estados vacíos: “Sin empleados” / “Sin turnos”.
3. Resaltar eventos: header con punto amarillo si `eventsByDate[date]` no vacío.
4. Diseño: dark, celdas redondeadas, similar a screenshot.
5. E2E: seed empleado + shift via API, visitar /calendar/biweek y comprobar que se pinta turno.

### Task 4: Navegación
**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Tests: update smoke if aplica

**Steps:**
1. Añadir link “Calendario quincena” en side/mobile nav.

### Task 5: Documentación
**Files:**
- Update: `docs/plans/2026-02-02-horarios-quincena.md` (estado)

**Steps:**
1. Marcar tareas completadas tras ejecución.

### Task 6: Verificación y commit
**Steps:**
1. `pnpm test -- tests/lib/calendar/biweek.test.ts`
2. `pnpm e2e -- --project=chromium --grep "calendar-biweek"`
3. Commit `feat(calendar): biweekly grid`
