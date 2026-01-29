# Forecasts Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Import daily breakfast forecasts from CSV/XLSX idempotently (replace by date), allow manual actuals, and surface the next 7 days on dashboard without auto-seeding.

**Architecture:** Keep logic in in-memory store for E2E/stub; enforce file-required import for real mode; support CSV parsing alongside XLSX; ensure upsert by `org_id, forecast_date`; add reset control; expose list endpoint; dashboard reads listDelta limited to 7 days ahead.

**Tech Stack:** Next.js app router (TS), Supabase client (unused in stub), XLSX, plain fetch for API calls, Vitest for unit tests, Playwright for e2e.

---

### Task 1: Harden import API (require file or rows, no demo)

**Files:**
- Modify: `src/app/api/forecasts/import/route.ts`
- Modify: `src/lib/forecast/import.ts`
- Modify: `src/lib/forecast/store.ts`

**Step 1: Write failing tests (Vitest)**
```ts
// tests/lib/forecast/import.csv.test.ts
// - parse CSV with headers fecha, desayunos -> rows length > 0
// - upsertEntries replaces same date (not accumulates)
```

**Step 2: Run test to see it fail**
`pnpm vitest tests/lib/forecast/import.csv.test.ts`

**Step 3: Implement**
- Add CSV parsing using XLSX (sheet_from_csv) in `parseForecastCsv`.
- Expose `upsertEntries` to replace by key (already merges; ensure overwrite not sum).
- In API, require file OR JSON rows; if neither -> 400; remove demo usage.
- Add GET `/api/forecasts` endpoint (already planned) to list entries.

**Step 4: Re-run tests**
`pnpm vitest tests/lib/forecast/import.csv.test.ts`

**Step 5: Commit**
`git add ... && git commit -m "feat: strict forecast import (csv/xlsx) and list endpoint"`

---

### Task 2: Manual actuals with validation and reset control

**Files:**
- Modify: `src/app/api/forecasts/real/route.ts`
- Modify: `src/lib/forecast/store.ts`
- Modify: `src/app/api/forecasts/reset/route.ts` (return count cleared)

**Step 1: Add tests**
```ts
// tests/lib/forecast/store.actual.test.ts
// - updateActual sets actual_breakfasts
// - delta calculation reflects new actual
// - reset clears entries
```

**Step 2: Implement**
- Validate body fields; respond 400 if missing.
- Ensure `updateActual` overwrites existing actual, not accumulates.
- Reset returns counts of cleared entries.

**Step 3: Run tests**
`pnpm vitest tests/lib/forecast/store.actual.test.ts`

**Step 4: Commit**
`git add ... && git commit -m "feat: forecast actuals validation and reset reporting"`

---

### Task 3: UI - Forecasts page without seeds, CSV/XLSX import, manual actuals, reset

**Files:**
- Modify: `src/app/(app)/forecasts/page.tsx`

**Step 1: UI updates**
- Remove demo fallback; require file selection.
- Show inline status messages (success/error).
- Add “Reset datos” button hitting `/api/forecasts/reset`.
- After import/actual save/ reset, refetch `/api/forecasts/delta`.
- Disable buttons while loading; basic error handling.

**Step 2: Smoke test manually**
`pnpm dev` → `/forecasts`: import sample CSV/XLSX, add real, reset.

**Step 3: Commit**
`git add src/app/(app)/forecasts/page.tsx && git commit -m "feat: forecasts UI require file, manual actuals, reset"`

---

### Task 4: Dashboard 7-day view

**Files:**
- Modify: `src/lib/dashboards/queries.ts`
- Modify: `src/app/(app)/dashboards/page.tsx`

**Step 1: Add helper**
- Function `getForecastWeek(orgId)` returning delta rows filtered `forecast_date >= today, <= +7d`.

**Step 2: UI**
- Show small table/card “Previsión próxima semana” with date, previsto, real, delta.

**Step 3: Minimal tests**
`pnpm vitest tests/lib/dashboards/queries.test.ts` (add week filter case).

**Step 4: Commit**
`git add ... && git commit -m "feat: dashboard shows 7-day forecast delta"`

---

### Task 5: e2e happy path (import -> real -> dashboard)

**Files:**
- Modify/Create: `tests/e2e/forecasts-week.spec.ts`

**Step 1: Test flow**
- POST import JSON rows (two dates), POST real for one date, visit `/dashboards`, assert table shows two rows and correct delta.

**Step 2: Run e2e**
`pnpm playwright test tests/e2e/forecasts-week.spec.ts --project=chromium`

**Step 3: Commit**
`git add tests/e2e/forecasts-week.spec.ts && git commit -m "test: e2e forecasts week view"`

---

Plan complete. Two execution options:
1) Subagent-driven here (recommended) using superpowers:subagent-driven-development.
2) Separate session with superpowers:executing-plans.
