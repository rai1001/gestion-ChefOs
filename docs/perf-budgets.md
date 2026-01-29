# Performance Budgets – Cocina Hotels Core

Date: 2026-01-29  
Scope: P1 features (previsión, eventos, compras/recepción, producción, inventario), dashboards/alerts stubs.

## Budgets (targets in prod)
- Imports (forecasts/events): **< 30s** end-to-end per file, including checksum/idempotent upsert.
- Dashboards (KPIs/materialized views): **< 3s TTI** for main graphs (org-scoped).
- Alerts generation/cron: **< 1 min** from triggering event (reception delay/shortage, merma, expiry/rotura).
- Purchases sheet build: **< 2s** for ≤500 lines grouped by proveedor.
- Receptions pages: **< 1.5s** initial render (SSR).

## Levers / notes
- Use materialized views (`forecast_delta`, `kpi_alert_counts`) with refresh functions (`refresh_forecast_delta`, `refresh_kpi_alert_counts`).
- Triggers already emit alerts on reception delay/shortage, merma, expiry/rotura, pedido vencido.
- Enable Postgres indexes defined in `supabase/migrations/20260129_core_schema.sql` (org + date FKs); keep ANALYZE current.
- For Next.js, prefer server components for list pages; cache/dedupe fetches where possible.
- Cron stub: `/api/cron/refresh-dashboards` should call refresh functions + alert sweeps.

## Measurement
- Local E2E smoke via `corepack pnpm playwright test tests/e2e/smoke.spec.ts --project=chromium --env:NEXT_PUBLIC_E2E=1 --env:E2E=1`.
- Budget regressions: add timers around imports and dashboard queries in Vitest when moving to prod DB.
