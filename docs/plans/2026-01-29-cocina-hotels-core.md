# Cocina Hotels Core (P1-P3) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the Cocina Hotels SaaS core (P1–P3): idempotent breakfast/event imports, menus & cost, production tasks with labels/inventory, purchases & reception alerts, inventory/merma/KPI dashboards, and mobile employees/turnos UI on Next.js 14 + Supabase.

**Architecture:** Next.js 14 App Router with typed Supabase client; Supabase Postgres for data/RLS/storage; background jobs via Edge/cron routes for recalcs; XLSX parsing on API routes; server actions for mutations; SSR for dashboards; Playwright for critical flows; Vitest for units.

**Tech Stack:** TypeScript, Next.js 14, React Server Components, Tailwind, Supabase (DB, storage, pgvector optional), `xlsx`, `zod`, `jsbarcode` (canvas), Vitest, Playwright, pnpm.

---

### Task 1: Tooling & shared client setup

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/config.ts`
- Modify: `.env.local.example`, `package.json`, `pnpm-lock.yaml` (after install)
- Test: `tests/setup/vitest.setup.ts`, `tests/lib/supabase.test.ts`

**Step 1: Write the failing test**

```ts
// tests/lib/supabase.test.ts
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "~/lib/supabase/client";

test("client uses env vars and caches single instance", () => {
  expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
  expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  const again = supabaseClient();
  expect(supabaseClient()).toBe(again);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/lib/supabase.test.ts --runInBand`
Expected: FAIL (missing implementation).

**Step 3: Write minimal implementation**

Implement `src/lib/supabase/client.ts` exporting memoized client, config loader in `src/lib/config.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/lib/supabase.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/config.ts tests/lib/supabase.test.ts .env.local.example package.json pnpm-lock.yaml
git commit -m "chore: add supabase client setup"
```

---

### Task 2: Database schema + RLS baseline

**Files:**
- Create: `supabase/migrations/20260129_core_schema.sql`
- Test: `tests/db/schema.test.ts` (uses supabase test db via env `SUPABASE_DB_URL_TEST`)

**Step 1: Write the failing test**

```ts
// tests/db/schema.test.ts
import { sql } from "@supabase/postgrest-js";
// pseudo-test hitting test DB with simple selects per table name
```

Assert required tables: forecasts, forecast_imports, events, event_imports, menus, recipes, recipe_ingredients, allergens, tasks, task_logs, labels, inventory_lots, products, suppliers, purchase_orders, purchase_lines, receptions, reception_lines, employees, shifts, shift_assignments, dashboards/materialized views; and RLS enabled for role columns.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/db/schema.test.ts --runInBand`
Expected: FAIL (tables missing).

**Step 3: Write minimal implementation**

Add migration creating tables with primary keys, foreign keys, version columns for idempotency (per date/import_id), RLS policies by `org_id` and role (planner, coordinator, chef, buyer, admin, employee). Include materialized views for KPIs skeleton.

**Step 4: Run test to verify it passes**

Run migrations against test DB, then `pnpm vitest tests/db/schema.test.ts --runInBand`.

**Step 5: Commit**

```bash
git add supabase/migrations/20260129_core_schema.sql tests/db/schema.test.ts
git commit -m "feat: add core schema and RLS baseline"
```

---

### Task 3: Breakfast forecast import (idempotent Excel) [P1]

**Files:**
- Create: `src/app/api/forecasts/import/route.ts`, `src/lib/forecast/import.ts`
- Modify: `src/lib/config.ts` (max upload size), `tests/lib/forecast/import.test.ts`
- Test: `tests/e2e/forecasts-import.spec.ts` (Playwright)

**Step 1: Write the failing test**

Unit: parse sample Excel to rows, ensure second import replaces prior version for date.
E2E: upload same Excel twice → DB has single version with latest hash; delta view empty until real counts.

**Step 2: Run tests to verify they fail**

`pnpm vitest tests/lib/forecast/import.test.ts --runInBand`
`pnpm playwright test tests/e2e/forecasts-import.spec.ts`
Expected: FAIL (no route/logic).

**Step 3: Write minimal implementation**

Implement API route: accept Excel, compute hash, upsert into `forecast_imports` and `forecasts` per date; use transaction with `insert ... on conflict (org_id,date) do update`; return rows count; validate with zod; limit file size.

**Step 4: Run tests to verify they pass**

Run same commands; expect PASS.

**Step 5: Commit**

```bash
git add src/app/api/forecasts/import/route.ts src/lib/forecast/import.ts tests/lib/forecast/import.test.ts tests/e2e/forecasts-import.spec.ts
git commit -m "feat: idempotent breakfast forecast import"
```

---

### Task 4: Real breakfast counts + delta view [P1]

**Files:**
- Create: `src/app/api/forecasts/real/route.ts`, `src/app/(app)/forecasts/page.tsx`
- Modify: `supabase/migrations/20260129_core_schema.sql` (real_counts table), `tests/db/schema.test.ts`
- Test: `tests/lib/forecast/real.test.ts`, `tests/e2e/forecasts-delta.spec.ts`

**Step 1: Write the failing test**

Unit: posting real counts stores `actual` and recalculates delta view/materialized view.
E2E: UI shows delta and updates after submission.

**Step 2: Run tests to verify they fail**

`pnpm vitest tests/lib/forecast/real.test.ts --runInBand`
`pnpm playwright test tests/e2e/forecasts-delta.spec.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

API route for real counts; server component rendering delta table; refresh materialized view; optimistic UI state.

**Step 4: Run tests to verify they pass**

Run the tests above.

**Step 5: Commit**

```bash
git add src/app/api/forecasts/real/route.ts src/app/(app)/forecasts/page.tsx supabase/migrations/20260129_core_schema.sql tests/lib/forecast/real.test.ts tests/e2e/forecasts-delta.spec.ts
git commit -m "feat: real breakfast counts and delta view"
```

---

### Task 5: Events import + menu attach + production/purchase sheets [P1]

**Files:**
- Create: `src/app/api/events/import/route.ts`, `src/lib/events/import.ts`, `src/app/api/events/:id/attach-menu/route.ts`, `src/app/api/events/:id/sheets/route.ts`
- Modify: `supabase/migrations/20260129_core_schema.sql` (event_menu link, sheets tables)
- Test: `tests/lib/events/import.test.ts`, `tests/e2e/events-import.spec.ts`, `tests/e2e/event-sheets.spec.ts`

**Step 1: Write the failing test**

Unit: idempotent import by date+version; attaching menu from DB or uploaded file; production/purchase sheet quantity scaling by attendees.
E2E: import same Excel twice (no dup); attach menu and generate sheets.

**Step 2: Run tests to verify they fail**

Run vitest and Playwright tests; expect FAIL.

**Step 3: Write minimal implementation**

Implement import route mirroring forecasts with `event_imports`; attach-menu route reads existing recipes or stores uploaded file reference; sheets route composes ingredients and supplier list; use transaction; guard OCR placeholder.

**Step 4: Run tests to verify they pass**

Re-run vitest + Playwright.

**Step 5: Commit**

```bash
git add src/app/api/events/import/route.ts src/lib/events/import.ts src/app/api/events/:id/attach-menu/route.ts src/app/api/events/:id/sheets/route.ts supabase/migrations/20260129_core_schema.sql tests/lib/events/import.test.ts tests/e2e/events-import.spec.ts tests/e2e/event-sheets.spec.ts
git commit -m "feat: idempotent events import and menu sheets"
```

---

### Task 6: Recipes, allergens, and theoretical cost [P1]

**Files:**
- Create: `src/app/(app)/recipes/page.tsx`, `src/app/api/recipes/route.ts`
- Modify: `supabase/migrations/20260129_core_schema.sql` (allergens join table), `tests/db/schema.test.ts`
- Test: `tests/lib/recipes/cost.test.ts`, `tests/e2e/recipes-crud.spec.ts`

**Step 1: Write the failing test**

Unit: cost calculation sums ingredient cost*qty/portion; allergens surface in response.
E2E: create recipe, view allergens badges.

**Step 2: Run tests to verify they fail**

Run vitest and Playwright; expect FAIL.

**Step 3: Write minimal implementation**

Server route CRUD with zod validation; UI table/form; cost computed in SQL view or service; cache on write.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/(app)/recipes/page.tsx src/app/api/recipes/route.ts supabase/migrations/20260129_core_schema.sql tests/lib/recipes/cost.test.ts tests/e2e/recipes-crud.spec.ts
git commit -m "feat: recipes with allergens and theoretical cost"
```

---

### Task 7: Production tasks workflow + label generation [P1]

**Files:**
- Create: `src/app/api/tasks/route.ts`, `src/app/api/tasks/:id/start/route.ts`, `src/app/api/tasks/:id/finish/route.ts`, `src/app/api/labels/route.ts`
- Modify: `src/app/(app)/tasks/page.tsx`, `supabase/migrations/20260129_core_schema.sql` (tasks, task_logs, labels, inventory_lots linkage)
- Test: `tests/lib/tasks/workflow.test.ts`, `tests/e2e/tasks-labels.spec.ts`

**Step 1: Write the failing test**

Unit: cannot finish without start; start/finish timestamps recorded; label creation inserts inventory lot with expiry/barcode.
E2E: start task, finish, generate label → lot exists with barcode image URL.

**Step 2: Run tests to verify they fail**

Run vitest + Playwright; expect FAIL.

**Step 3: Write minimal implementation**

APIs enforcing state machine; barcode via `jsbarcode` on server (canvas), upload to Supabase storage; label creation transactionally inserts inventory lot with expiry validation.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/api/tasks/route.ts src/app/api/tasks/:id/start/route.ts src/app/api/tasks/:id/finish/route.ts src/app/api/labels/route.ts src/app/(app)/tasks/page.tsx supabase/migrations/20260129_core_schema.sql tests/lib/tasks/workflow.test.ts tests/e2e/tasks-labels.spec.ts
git commit -m "feat: task workflow and label-driven inventory lots"
```

---

### Task 8: Purchases sheet generation [P1]

**Files:**
- Create: `src/app/api/purchases/sheet/route.ts`, `src/lib/purchases/build-sheet.ts`
- Modify: `src/app/(app)/purchases/page.tsx`
- Test: `tests/lib/purchases/sheet.test.ts`, `tests/e2e/purchases-sheet.spec.ts`

**Step 1: Write the failing test**

Unit: groups needs by supplier, computes deadline via lead time/delivery days, 95% coverage threshold.
E2E: UI shows grouped suppliers with deadlines.

**Step 2: Run tests to verify they fail**

Run vitest + Playwright; expect FAIL.

**Step 3: Write minimal implementation**

Build sheet from forecasts/events/recipes; deadline calculation function; server component rendering table/export CSV.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/api/purchases/sheet/route.ts src/lib/purchases/build-sheet.ts src/app/(app)/purchases/page.tsx tests/lib/purchases/sheet.test.ts tests/e2e/purchases-sheet.spec.ts
git commit -m "feat: purchase sheet generation"
```

---

### Task 9: Reception with photo, alerts, partial intake [P1]

**Files:**
- Create: `src/app/api/receptions/route.ts`, `src/app/api/receptions/:id/lines/route.ts`
- Modify: `src/app/(app)/receptions/page.tsx`, `supabase/migrations/20260129_core_schema.sql` (reception_lines, alerts)
- Test: `tests/lib/receptions/partial.test.ts`, `tests/e2e/receptions-alerts.spec.ts`

**Step 1: Write the failing test**

Unit: compare received vs ordered; flag shortages/delay; allow partial inventory intake; store photo path.
E2E: upload albarán photo, see alert banner, partial intake reflected in inventory.

**Step 2: Run tests to verify they fail**

Run vitest + Playwright; expect FAIL.

**Step 3: Write minimal implementation**

Routes to upsert reception and lines; storage upload for photo; trigger alerts table; partial lot creation for received qty only.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/api/receptions/route.ts src/app/api/receptions/:id/lines/route.ts src/app/(app)/receptions/page.tsx supabase/migrations/20260129_core_schema.sql tests/lib/receptions/partial.test.ts tests/e2e/receptions-alerts.spec.ts
git commit -m "feat: receptions with alerts and partial intake"
```

---

### Task 10: Inventory, merma, and cost reconciliation [P2]

**Files:**
- Create: `src/app/api/inventory/merma/route.ts`, `src/lib/inventory/costing.ts`
- Modify: `src/app/(app)/inventory/page.tsx`, `supabase/migrations/20260129_core_schema.sql` (merma table, cost views)
- Test: `tests/lib/inventory/costing.test.ts`, `tests/e2e/inventory-merma.spec.ts`

**Step 1: Write the failing test**

Unit: merma reduces lot qty and adjusts real cost; alert for low stock.
E2E: register merma → cost KPI updates, rotura alert appears.

**Step 2: Run tests to verify they fail**

Run vitest + Playwright; expect FAIL.

**Step 3: Write minimal implementation**

Costing helper to recompute real cost per recipe/event; merma route with validations; UI to record merma and see updated costs.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/api/inventory/merma/route.ts src/lib/inventory/costing.ts src/app/(app)/inventory/page.tsx supabase/migrations/20260129_core_schema.sql tests/lib/inventory/costing.test.ts tests/e2e/inventory-merma.spec.ts
git commit -m "feat: inventory merma and cost reconciliation"
```

---

### Task 11: KPI dashboards (previsión vs real, costs, roturas, caducidad) [P2]

**Files:**
- Create: `src/app/(app)/dashboards/page.tsx`, `src/lib/dashboards/queries.ts`
- Modify: `supabase/migrations/20260129_core_schema.sql` (materialized views + refresh function)
- Test: `tests/lib/dashboards/queries.test.ts`, `tests/e2e/dashboards.spec.ts`

**Step 1: Write the failing test**

Unit: queries return deltas and alert counts within thresholds; respects pagination and filters.
E2E: dashboard loads <3s, shows trend charts and alerts.

**Step 2: Run tests to verify they fail**

Run vitest + Playwright; expect FAIL.

**Step 3: Write minimal implementation**

SQL views/materialized views refreshed on mutations or scheduled cron; dashboard server component with charts (e.g., `@nivo` minimal) and alert list.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add src/app/(app)/dashboards/page.tsx src/lib/dashboards/queries.ts supabase/migrations/20260129_core_schema.sql tests/lib/dashboards/queries.test.ts tests/e2e/dashboards.spec.ts
git commit -m "feat: KPI dashboards with materialized views"
```

---

### Task 12: Employees and mobile turnos UX [P3]

**Files:**
- Create: `src/app/(app)/mobile/turnos/page.tsx`, `src/app/api/turnos/route.ts`
- Modify: `supabase/migrations/20260129_core_schema.sql` (employees, shifts, assignments), `src/app/(app)/tasks/page.tsx` (mobile-friendly layout)
- Test: `tests/e2e/mobile-turnos.spec.ts`

**Step 1: Write the failing test**

Playwright: mobile viewport shows shifts, tasks list, start/finish works; vacations block assignments.

**Step 2: Run test to verify it fails**

`pnpm playwright test tests/e2e/mobile-turnos.spec.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

API for shifts CRUD respecting vacations/bajas; responsive UI using Tailwind; reuse task workflow actions; offline-friendly caching optional.

**Step 4: Run test to verify it passes**

Re-run Playwright test.

**Step 5: Commit**

```bash
git add src/app/(app)/mobile/turnos/page.tsx src/app/api/turnos/route.ts supabase/migrations/20260129_core_schema.sql src/app/(app)/tasks/page.tsx tests/e2e/mobile-turnos.spec.ts
git commit -m "feat: mobile shifts and tasks UX"
```

---

### Task 13: Alerts & background refreshers

**Files:**
- Create: `src/app/api/cron/refresh-dashboards/route.ts`, `src/app/api/alerts/route.ts`
- Modify: `supabase/migrations/20260129_core_schema.sql` (alerts table, pg cron job or trigger), `tests/lib/alerts.test.ts`

**Step 1: Write the failing test**

Unit: alert creation for shortage, delay, expiry; cron refresh calls SQL function.

**Step 2: Run test to verify it fails**

`pnpm vitest tests/lib/alerts.test.ts --runInBand`
Expected: FAIL.

**Step 3: Write minimal implementation**

Edge cron route calling RPC to refresh materialized views and emit alerts; alert API for listing/dismissing.

**Step 4: Run test to verify it passes**

Re-run vitest.

**Step 5: Commit**

```bash
git add src/app/api/cron/refresh-dashboards/route.ts src/app/api/alerts/route.ts supabase/migrations/20260129_core_schema.sql tests/lib/alerts.test.ts
git commit -m "feat: alert pipeline and cron refresh"
```

---

### Task 14: Security, RLS verification, and smoke tests

**Files:**
- Create: `tests/security/rls.test.ts`, `tests/e2e/smoke.spec.ts`
- Modify: `mcp.local.json` (if secrets path), `supabase/migrations/20260129_core_schema.sql` (policy tweaks)

**Step 1: Write the failing test**

RLS tests ensuring roles cannot cross orgs; anonymous blocked; planner vs chef access; smoke E2E visits key pages.

**Step 2: Run tests to verify they fail**

`pnpm vitest tests/security/rls.test.ts --runInBand`
`pnpm playwright test tests/e2e/smoke.spec.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

Adjust policies; seed test roles; ensure API routes check session role.

**Step 4: Run tests to verify they pass**

Re-run tests.

**Step 5: Commit**

```bash
git add tests/security/rls.test.ts tests/e2e/smoke.spec.ts mcp.local.json supabase/migrations/20260129_core_schema.sql
git commit -m "chore: harden RLS and add smoke coverage"
```

---

### Task 15: Performance budgets & docs

**Files:**
- Create: `docs/perf-budgets.md`, `docs/api-contracts.md`
- Modify: `package.json` (add `pnpm lint`, `pnpm test`, `pnpm playwright test` scripts), `README.md` (setup/run)
- Test: `pnpm lint`, `pnpm test`, `pnpm playwright test --list`

**Step 1: Write the failing test**

Add lint rule budget checks (e.g., `next lint` config) and Playwright `--list` to ensure specs registered.

**Step 2: Run tests to verify they fail**

`pnpm lint && pnpm test && pnpm playwright test --list`
Expected: lint/test fail until scripts/docs exist.

**Step 3: Write minimal implementation**

Add scripts, document budgets (API response times, dashboard <3s, imports <30s), describe endpoints.

**Step 4: Run tests to verify they pass**

Re-run combined command.

**Step 5: Commit**

```bash
git add docs/perf-budgets.md docs/api-contracts.md package.json README.md
git commit -m "docs: add performance budgets and api contracts"
```

---

Execution options after plan approval:
1) Subagent-driven in this session (use superpowers:subagent-driven-development per task).
2) Parallel session dedicated to execution (use superpowers:executing-plans).
