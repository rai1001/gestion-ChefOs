# API Contracts – Cocina Hotels Core (P1 scope)

Auth: Supabase session via `proxy` (App Router). In E2E/stub mode (`NEXT_PUBLIC_E2E=1` or `E2E=1`) routes use in-memory stores; no Supabase calls.

## Forecasts (US1)
- `POST /api/forecasts/import` – body `{ org_id, rows:[{forecast_date, guests, breakfasts}] }` → upsert per `(org_id, forecast_date)`.
- `POST /api/forecasts/real` – body `{ org_id, forecast_date, actual_breakfasts }` → updates real count, refreshes `forecast_delta`.
- `GET /api/forecasts/delta` – list deltas.
- `POST /api/forecasts/reset` – E2E helper to clear stores.

## Events (US2)
- `POST /api/events/import` – body `{ org_id, rows:[{event_date, attendees, menu_name?}] }`.
- `POST /api/events/:id/attach-menu` – stub attach menu/recipe link.
- `POST /api/events/:id/sheets` – stub generate producción/compras sheets.

## Producción / Tareas (US3)
- `GET /api/tasks` – list; `POST /api/tasks` – create pending.
- `POST /api/tasks/:id/start` | `POST /api/tasks/:id/finish` – state machine.
- `POST /api/labels` – create etiqueta + lot; `GET /api/labels` – list lots (E2E).

## Compras y Recepción (US4)
- `POST /api/purchases/sheet` – body `{ items:[{supplier,product,quantity,unit,lead_time_days,delivery_days?}] }` → grouped sheet; `GET /api/purchases/sheet` returns last.
- `GET/POST/DELETE /api/receptions` – create/reset/list receptions.
- `POST /api/receptions/:id/lines` – register partial line `{ qty, received_at }`.
- `PATCH /api/receptions/:id/lines` – finalize reception; returns alerts.
- `GET /api/receptions/alerts` – list alerts (delay/shortage).

## Inventario / Merma (US5)
- `POST /api/inventory/merma` – body `{ lot_id, quantity }` → reduces lot, logs merma; emits alert.

## Alerts & Cron
- `GET /api/alerts` – list generated alerts.
- `GET /api/cron/refresh-dashboards` – stub; should call refresh of materialized views + alert sweeps in prod.

## Pages (client)
- `/forecasts`, `/events`, `/tasks`, `/purchases`, `/receptions`, `/inventory`.

## Data model notes
- See `supabase/migrations/20260129_core_schema.sql` for RLS, indexes, triggers (`forecast_delta`, `kpi_alert_counts`, alert triggers on reception, merma, expiry/rotura, order due).
- Storage buckets (manual CLI): `labels`, `albaranes` (private).
