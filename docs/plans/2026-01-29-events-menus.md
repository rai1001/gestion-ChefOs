# Events & Menus Implementation Plan (US2)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Import daily events from Excel/CSV idempotentemente (reemplaza por fecha), adjuntar menú (BD/archivo), generar hoja de producción/compras, mostrar calendario + listado sin seeds demo, con API clara para pruebas reales.

**Architecture:** In-memory store para modo stub/E2E; APIs Next.js app router; parsers XLSX/CSV; adjuntar menú y generar hoja usando datos de evento (asistentes) y menú (escandallo simplificado). UI cliente con fetch a APIs y mensajes de éxito/error. Preparar hook para OCR futuro (sin implementarlo).

**Tech Stack:** Next.js app router (TS), XLSX, fetch, Vitest, Playwright.

---

### Task 1: Parser e importación estricta (XLSX/CSV) sin seeds

**Files:**
- Modify: `src/lib/events/import.ts`
- Modify: `src/app/api/events/import/route.ts`
- Add tests: `tests/lib/events/import.csv.test.ts`

**Steps:**
1. Tests (Vitest): CSV parse; idempotencia por `org_id+event_date` (segunda import reemplaza menú/asistentes); rechazo si no hay archivo ni rows.
2. Implement: `parseEventsCsv` (XLSX CSV); API 400 si falta file/rows; quitar seeds demo.
3. Run tests: `pnpm vitest tests/lib/events/import.csv.test.ts`
4. Commit.

---

### Task 2: Adjuntar menú y hoja producción/compras

**Files:**
- Modify: `src/lib/events/store.ts` (hoja derivada)
- Modify: `src/app/api/events/[id]/attach-menu/route.ts`
- Modify: `src/app/api/events/[id]/sheets/route.ts`
- Add tests: `tests/lib/events/sheets.test.ts`

**Steps:**
1. Tests: attach sets menu_name; sheets devuelve producción = asistentes, compras = asistentes * factor.
2. Implement: store guarda asistentes, menú; sheets calcula `{production_items, purchases_items}`.
3. Run tests.
4. Commit.

---

### Task 3: API listado eventos y calendario

**Files:**
- Modify: `src/app/api/events/route.ts`
- Add tests: `tests/lib/events/list.test.ts`

**Steps:**
1. Ensure GET devuelve eventos ordenados por fecha.
2. Add optional query `from`/`to` para filtrar rango.
3. Tests y commit.

---

### Task 4: UI Events real (sin demo) con estados

**Files:**
- Modify: `src/app/(app)/events/page.tsx`

**Steps:**
1. Eliminar cargas demo; botones deshabilitados hasta seleccionar archivo/fecha.
2. Import form requiere archivo; mensajes de éxito/error.
3. Adjuntar menú: select de origen BD (stub) + file disabled (placeholder OCR); feedback.
4. Generar hoja: muestra producción/compras; refresca tabla eventos.
5. Calendario: marca eventos y permite seleccionar fecha; sin seed automático.
6. Manual smoke: `pnpm dev` -> `/events`.
7. Commit.

---

### Task 5: Playwright e2e flujo eventos

**Files:**
- Add: `tests/e2e/events-flow.spec.ts`

**Steps:**
1. Flow: POST import rows (API), attach menú, GET sheets, visit `/events` and assert UI shows rows, estado “Menú adjunto”, hoja generada.
2. Run: `pnpm playwright test tests/e2e/events-flow.spec.ts --project=chromium`
3. Commit.

---

Plan complete. Execution options: Subagent-driven here or separate session with executing-plans. Proceed with Task 1.***
