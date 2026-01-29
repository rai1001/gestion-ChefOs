---

description: "Task list for Cocina Hotels core (P1-first)"
---

# Tasks: Cocina Hotels SaaS Core

**Input**: `.specify/specs/001-cocina-hotels/spec.md`, `docs/plans/2026-01-29-cocina-hotels-core.md`
**Skills to apply**: supabase-best-practices, supabase-postgres-best-practices, vercel-react-best-practices, nextjs-supabase-auth.
**Principles**: TDD (tests first → fail → implement), P1 before P2/P3, Supabase RLS everywhere.

## Format: `[ID] [P?] [Story] Description (deps)`
`[P]` means parallel-safe.

---

## Phase 1: Setup & Auth Baseline (shared)
- [x] T001 [P] [Setup] Ensure pnpm path available; add scripts `test`, `test:watch`, `e2e`, `e2e:list`, `lint` (package.json already set) — verify.
- [x] T002 [P] [Auth] Integrate Supabase Auth per nextjs-supabase-auth: add `src/lib/auth/supabase-browser.ts`, server client, `middleware.ts` protecting `/app` routes; update `_app`/layout providers. Tests: `tests/lib/auth/client.test.ts` (Vitest), `tests/e2e/auth-login.spec.ts` (Playwright) with mocked Supabase UI page.
- [x] T003 [P] [Setup] Add global UI primitives per vercel-react-best-practices: root layout, font, error boundary; smoke test `tests/e2e/smoke.spec.ts` scaffold.

---

## Phase 2: Foundational DB & RLS (blocking)
- [x] T004 [P] [Found] Flesh out `supabase/migrations/20260129_core_schema.sql` with indexes, NOT NULLs, foreign keys, ON CONFLICT upserts aligning with supabase-postgres-best-practices; include materialized views stubs for KPIs.
- [x] T005 [P] [Found] Add RLS policies for all tables (planner, coordinator, chef, buyer, admin, employee) using supabase-best-practices; include row owners and org_id checks; add RLS tests `tests/security/rls.test.ts` (extend) and `tests/db/schema.test.ts` for indexes.
- [x] T006 [Found] Seed storage bucket definitions (labels, albaranes) doc note; add migration comment or SQL to ensure bucket creation via supabase CLI if applicable.

**Checkpoint**: All foundational tests passing before stories.

---

## Phase 3: US1 Previsión desayunos idempotente (P1)
Tests first:
- [x] T007 [P] [US1] Vitest `tests/lib/forecast/import.test.ts` (hash/idempotent upsert per date, size limit).
- [x] T008 [P] [US1] Vitest `tests/lib/forecast/real.test.ts` (delta recompute/materialized view refresh).
- [x] T009 [US1] Playwright `tests/e2e/forecasts-import.spec.ts`, `tests/e2e/forecasts-delta.spec.ts` (double upload replaces; delta shown after real counts).
Implementation:
- [x] T010 [P] [US1] API route `src/app/api/forecasts/import/route.ts` using `xlsx`, zod, transactional upsert (`on conflict (org_id, forecast_date)`), checksum; apply supabase-postgres-best-practices for indexes.
- [x] T011 [P] [US1] Service `src/lib/forecast/import.ts` shared by route; include idempotent logic + Supabase RPC if needed.
- [x] T012 [US1] API `src/app/api/forecasts/real/route.ts` storing actual counts and refreshing delta materialized view.
- [x] T013 [US1] UI `src/app/(app)/forecasts/page.tsx` (server component) showing forecast vs real delta; vercel-react-best-practices for streaming/SSR.

---

## Phase 4: US2 Eventos import + menú adjunto (P1)
Tests first:
- [x] T014 [P] [US2] Vitest `tests/lib/events/import.test.ts` (idempotent by date+version; hashing).
- [x] T015 [US2] Playwright `tests/e2e/events-import.spec.ts` (double import replaces).
- [x] T016 [US2] Playwright `tests/e2e/event-sheets.spec.ts` (attach menu, generate sheets scaled by attendees).
Implementation:
- [x] T017 [P] [US2] API `src/app/api/events/import/route.ts` mirroring forecast import with `event_imports`.
- [x] T018 [US2] API `src/app/api/events/[id]/attach-menu/route.ts` (DB menu or file upload stub for OCR later).
- [x] T019 [US2] API `src/app/api/events/[id]/sheets/route.ts` generating production & purchase sheets (ingredients, suppliers) using recipes.
- [x] T020 [US2] Migration updates for event_menu link + sheet views/materialized helpers.

---

## Phase 5: US3 Producción/mise en place con etiquetas (P1)
Tests first:
- [x] T021 [P] [US3] Vitest `tests/lib/tasks/workflow.test.ts` (cannot finish before start; timestamps).
- [x] T022 [P] [US3] Vitest `tests/lib/labels.test.ts` (label creates inventory lot with expiry/barcode upload).
- [x] T023 [US3] Playwright `tests/e2e/tasks-labels.spec.ts` (start→finish→label→inventory lot visible).
Implementation:
- [x] T024 [P] [US3] APIs `src/app/api/tasks/route.ts`, `/tasks/[id]/start/route.ts`, `/tasks/[id]/finish/route.ts` enforcing state machine.
- [x] T025 [US3] API `src/app/api/labels/route.ts` generating barcode via `jsbarcode`, storing in Supabase storage bucket, transactional lot insert.
- [x] T026 [US3] UI `src/app/(app)/tasks/page.tsx` (responsive) showing shifts/tasks and label action (reuse in US7).
- [x] T027 [US3] Migration: task_logs, labels, inventory_lots relations, constraints.

---

## Phase 6: US4 Compras y recepción con alertas (P1)
Tests first:
- [x] T028 [P] [US4] Vitest `tests/lib/purchases/sheet.test.ts` (group by supplier, deadline via lead time/delivery days, ≥95% coverage).
- [x] T029 [P] [US4] Vitest `tests/lib/receptions/partial.test.ts` (partial intake, alerts on shortage/delay).
- [x] T030 [US4] Playwright `tests/e2e/purchases-sheet.spec.ts`.
- [x] T031 [US4] Playwright `tests/e2e/receptions-alerts.spec.ts` (albarán photo upload, alert shown, partial lots).
Implementation:
- [x] T032 [P] [US4] API `src/app/api/purchases/sheet/route.ts` + helper `src/lib/purchases/build-sheet.ts`.
- [x] T033 [US4] UI `src/app/(app)/purchases/page.tsx` showing grouped suppliers + export.
- [x] T034 [US4] APIs `src/app/api/receptions/route.ts`, `/receptions/[id]/lines/route.ts` handling upload, alerts, partial lots.
- [x] T035 [US4] UI `src/app/(app)/receptions/page.tsx` discrepancy + alert view.
- [x] T036 [US4] Migration tweaks: purchase_orders/lines, receptions/lines, alerts triggers.

---

## Phase 7: US5 Inventario, costes y mermas (P2)
Tests first:
- [x] T037 [P] [US5] Vitest `tests/lib/inventory/costing.test.ts` (real cost recompute on merma; rotura alert).
- [x] T038 [US5] Playwright `tests/e2e/inventory-merma.spec.ts`.
Implementation:
- [x] T039 [P] [US5] API `src/app/api/inventory/merma/route.ts` updating lot qty, logging merma.
- [x] T040 [US5] Helper `src/lib/inventory/costing.ts` recomputing recipe/event costs + view refresh.
- [x] T041 [US5] UI `src/app/(app)/inventory/page.tsx` (products, lots, merma actions).
- [x] T042 [US5] Migration: merma table, cost views, rotura/caducidad alert triggers.

---

## Phase 8: US6 Dashboards KPI (P2)
Tests first:
- [ ] T043 [P] [US6] Vitest `tests/lib/dashboards/queries.test.ts` (deltas, alert counts, pagination limits, perf budget <3s via mocked timers).
- [ ] T044 [US6] Playwright `tests/e2e/dashboards.spec.ts` (loads within budget, shows trends & alerts).
Implementation:
- [ ] T045 [P] [US6] Queries helper `src/lib/dashboards/queries.ts` using materialized views with filters.
- [ ] T046 [US6] UI `src/app/(app)/dashboards/page.tsx` (server component, charts minimal @nivo) per vercel-react-best-practices.
- [ ] T047 [US6] Migration: finalize materialized views + refresh function/cron hooks.

---

## Phase 9: US7 Empleados y turnos móvil (P3)
Tests first:
- [x] T048 [US7] Playwright `tests/e2e/mobile-turnos.spec.ts` (mobile viewport, shifts visible, start/finish tasks, vacations block assignment).
Implementation:
- [x] T049 [P] [US7] API `src/app/api/turnos/route.ts` CRUD for shifts/assignments honoring vacations/bajas.
- [x] T050 [US7] UI `src/app/(app)/mobile/turnos/page.tsx` responsive list; reuse task actions; offline caching optional.
- [x] T051 [US7] Adjust `src/app/(app)/tasks/page.tsx` shared responsive styles.
- [x] T052 [US7] Migration additions: employees, shifts, assignments, vacations/bajas.

---

## Phase 10: Alerts, cron refreshers, smoke
- [x] T053 [P] [Alerts] Vitest `tests/lib/alerts.test.ts` (shortage/delay/expiry alerts, cron refresh call) – tests first.
- [x] T054 [P] [Alerts] API `src/app/api/alerts/route.ts` list/dismiss.
- [x] T055 [P] [Alerts] Edge cron `src/app/api/cron/refresh-dashboards/route.ts` calling SQL refresh & alert generation.
- [x] T056 [Smoke] Extend `tests/e2e/smoke.spec.ts` to hit forecasts, events, tasks, purchases, dashboards.

---

## Phase 11: Docs & performance budgets
- [ ] T057 [P] [Docs] `docs/perf-budgets.md` (imports <30s, dashboards <3s, alerts <1m) and reference vercel-react-best-practices caching/streaming.
- [ ] T058 [P] [Docs] `docs/api-contracts.md` endpoints + auth requirements; update `README.md` run/test instructions.
- [ ] T059 [Docs] Run `pnpm lint && pnpm test && pnpm e2e:list` before handoff; record results.

---

## Completion Checklist
- [ ] All phases green; P1 stories verified first.
- [ ] RLS tests passing; storage buckets configured; env vars set.
- [ ] Cron/alerts scheduled; perf budgets documented.
- [ ] Ready for QA/release.
