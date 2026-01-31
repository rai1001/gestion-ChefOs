# Producción → Tareas por turno Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Map production tasks (generadas desde eventos/menús o manuales) a turnos (mañana 06:00‑14:00, tarde 16:00‑24:00) hasta 15 días vista, con start/finish controlado, vista móvil para cocineros y alertas por tareas sin completar.

**Architecture:** API Next.js App Router backed by Supabase `tasks` table (persistente) + E2E stub store for tests. Frontend React (App Router) con vistas desktop/móvil: backlog 15 días, filtro por día/turno, botones Start/Finish (Finish solo tras Start), badge de alerta. Alerts endpoint reutiliza `/api/alerts` agregando pendientes vencidas.

**Tech Stack:** Next.js 16 (App Router), Supabase JS, Zod, Playwright E2E, Vitest.

---

### Task 1: Modelo y seed de tareas de producción
**Files:**
- Modify: `supabase/migrations/*.sql` (nueva tabla `tasks` con campos: id, org_id, title, event_id?, recipe_id?, servings, hall, due_date, shift, priority, status, started_at, finished_at, assignee, created_at).
- Modify: `supabase/seed_purchases.sql` (añadir seeds mínimos de tasks).
- Tests: `tests/db/schema.test.ts` (añadir asserts de columnas `tasks`).

**Steps:**
1. Añadir migration SQL con tabla y constraint status ENUM(`pending`,`in_progress`,`done`), shift ENUM(`morning`,`evening`), due_date date, org_id text default 'org-dev'.
2. Seed 2-3 tasks demo.
3. Actualizar test de schema para verificar tabla y columnas.

### Task 2: Store/servicio de tareas (Supabase + stub)
**Files:**
- Modify: `src/lib/tasks/store.ts`
- Modify: `src/lib/tasks/workflow.test.ts` (ajustar a shifts y status guard)
- New: `src/lib/tasks/types.ts` (Task type con campos anteriores)

**Steps:**
1. Definir tipo Task y helpers `isAfterShift`, `shiftWindow` (06-14 / 16-24).
2. Implementar `listTasks({from,to,shift})` con Supabase en prod y Map stub en E2E.
3. Implementar `createTask`, `startTask`, `finishTask` (finish solo si status in_progress).
4. Tests vitest cubriendo flujos con stub.

### Task 3: API REST para tareas
**Files:**
- New: `src/app/api/tasks/route.ts` (GET/POST)
- New: `src/app/api/tasks/[id]/start/route.ts`
- New: `src/app/api/tasks/[id]/finish/route.ts`

**Steps:**
1. GET acepta query `from`,`to`,`shift`; usa servicio.
2. POST crea tarea (body validado con Zod) permitiendo origen `manual` o `production` (event_id/recipe_id).
3. start/finish endpoints validan estado y responden 409 si regla violada.
4. Añadir pruebas Playwright stubs? (ver Task 7).

### Task 4: Generación desde hoja de producción (eventos/menús)
**Files:**
- Modify: `src/lib/events/sheets.ts` (o módulo actual de hojas)
- Modify: `src/lib/tasks/workflow.ts` (añadir `createTasksFromSheet(sheetLines)`).
- Tests: `tests/lib/events/sheets.test.ts` (añadir caso genera tareas).

**Steps:**
1. Mapear cada línea de producción a Task: title=receta, servings=pax, hall/salon, due_date=fecha evento, shift=turno asignado (regla: mañana si hora <14h else tarde).
2. Evitar duplicados por (event_id, recipe_id, due_date, shift) al regenerar.
3. Exponer helper para usar en UI (botón “Aplicar a tareas”).

### Task 5: UI web desktop (planificación 15 días)
**Files:**
- Modify: `src/app/(app)/tasks/page.tsx`
- Modify: `src/app/(app)/tasks/styles` if needed (existing)
- Possibly new components under `src/components/tasks/…`

**Steps:**
1. Añadir cabecera con selector de día (hoy + 14) y toggle turno (mañana/tarde).
2. Lista de tarjetas con datos definidos (title, recipe/servings, hall, event, due_date, shift, priority, status, assignee).
3. Botones Start / Finish (Finish disabled hasta Start). Llama endpoints; bloquea doble finish.
4. Botón “Aplicar hoja de producción” que dispara helper de Task 4 (uso fetch POST /api/tasks con payload sheetId? o sheet lines preseleccionadas).
5. Estado vacío y badges de prioridad/alerta (pendiente vencida).
6. Asegurar responsive para móvil (component reuse).

### Task 6: UI móvil para cocineros (turno del día)
**Files:**
- Modify: `src/app/(mobile)/tasks/page.tsx` (o crear si no existe; reusar components)

**Steps:**
1. Vista filtrada automáticamente a día actual y turno por query ?shift=morning|evening.
2. Botones Start/Finish grandes; no permitir Finish si no hay Start.
3. Mostrar alerta si tarea vencida o sin iniciar al final del turno.

### Task 7: Alertas y dashboard
**Files:**
- Modify: `src/app/api/alerts/route.ts`
- Modify: `src/lib/dashboards/queries.ts`
- Tests: `tests/lib/alerts.test.ts`, `tests/lib/dashboards/queries.test.ts`

**Steps:**
1. Incorporar tareas vencidas (due_date < hoy o turnos pasados) status != done al endpoint de alerts.
2. Dashboard: sumar alerta por tareas pendientes; mostrar top 5 tasks soon (≤2 días).
3. Ajustar pruebas con stubs.

### Task 8: E2E Playwright
**Files:**
- New: `tests/e2e/tasks-production.spec.ts`
- Update: `playwright.config.ts` (si requiere tag)

**Steps:**
1. Flujo: importar hoja → aplicar a tareas → ver en /tasks día evento → start → finish.
2. Flujo móvil: ver turno, start, finish bloqueado sin start.
3. Assert alerta en dashboard si no se termina.

### Task 9: Documentación
**Files:**
- Update: `docs/api-contracts.md` (nuevos endpoints)
- Update: `docs/perf-budgets.md` (si cambia carga)
- Update: `.specify/memory/constitution.md` (notas pendientes)

**Steps:**
1. Documentar payloads, reglas de estado, turnos fijos, ventana 15 días.
2. Añadir nota de alerta por pendientes.

### Task 10: Verificación y commit final
**Steps:**
1. `pnpm vitest --exclude tests/e2e/**`
2. `pnpm e2e`
3. `git status`, `git add`, `git commit -m "feat: tareas por turno desde hoja de producción"`
4. Push y revisar CI.

---

Plan completo listo. Cuando quieras, procedo a ejecutar por tareas con TDD.***
