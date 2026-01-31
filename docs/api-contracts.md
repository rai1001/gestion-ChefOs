# API Contracts – Cocina Hotels Core (P1)

Auth: Supabase session vía `proxy` (App Router). Modo E2E/stub (`NEXT_PUBLIC_E2E=1` o `E2E=1`): in-memory stores, sin Supabase.

## Forecasts (US1)
- `POST /api/forecasts/import` – multipart CSV/XLSX o JSON `{ rows:[{ forecast_date, breakfasts }] }`; upsert por `(org_id, forecast_date)`.
- `POST /api/forecasts/real` – `{ org_id, forecast_date, actual_breakfasts }`; refresca `forecast_delta`.
- `GET /api/forecasts/delta` – lista delta previsto vs real.
- `POST /api/forecasts/reset` – helper E2E.

## Events (US2)
- `POST /api/events/import` – multipart XLSX (matriz fecha x salón) o JSON `{ rows:[{ event_date, hall, name, event_type?, attendees }] }`; upsert `(org_id,event_date,hall)`.
- `POST /api/events/:id/attach-menu` – `{ menu_name, hall? }`; si `hall` es nulo aplica a todos los salones de la fecha.
- `GET /api/events/:id/sheets?hall=...&aggregate=false` – hojas de producción/compras agregadas o por salón.
- `GET /api/dashboards/events/upcoming?days=30` – eventos próximos para dashboard.
- `GET /api/events` – lista en-memory en E2E (para UI).

## Producción / Tareas (US3)
- `GET /api/tasks` | `POST /api/tasks` – lista/crea tareas.
- `POST /api/tasks/:id/start` | `POST /api/tasks/:id/finish` – máquina de estados.
- `POST /api/labels` – crea etiqueta + lote; fallback E2E genera lote aunque la tarea falte.
- `GET /api/labels` – lista lotes creados.

## Compras y Recepción (US4)
- `GET /api/purchases/suppliers` – lista proveedores (lead_time, cutoff, días de reparto, prep/ship) desde Supabase o stub E2E.
- `GET /api/purchases/products` – catálogo por proveedor (no descuenta inventario).
- `POST /api/purchases/sheet` – `{ items:[{supplier,product,quantity,unit,event_date?,supplier_config?}] }` → calcula fecha límite y ETA de entrega; `GET /api/purchases/sheet` devuelve último.
- `GET/POST/DELETE /api/receptions` – listar/crear/resetear recepciones.
- `POST /api/receptions/:id/lines` – registrar parcial `{ qty, received_at }`.
- `PATCH /api/receptions/:id/lines` – finalizar; devuelve alertas.
- `GET /api/receptions/alerts` – alertas de retraso/falta.

## Inventario / Merma (US5)
- `POST /api/inventory/merma` – `{ lot_id, quantity }` → descuenta lote, registra merma y alerta.

## Turnos móvil (US7)
- `GET/POST/DELETE /api/turnos` – CRUD simple de turnos/assignments (store E2E).

## Alerts & Cron
- `GET /api/alerts` – lista alertas generadas.
- `GET /api/cron/refresh-dashboards` – stub; en prod debe refrescar materialized views + alert sweep.
- `POST /api/ocr?kind=menu|albaran|receta|generico` – multipart file; usa Mistral Vision si `MISTRAL_API_KEY` existe, stub en E2E.

## Pages
`/forecasts`, `/events`, `/tasks`, `/purchases`, `/receptions`, `/inventory`, `/dashboards`, `/mobile/turnos`.

## Notas de datos
- Esquema y RLS: `supabase/migrations/20260129_core_schema.sql` (índices `org_id` + fecha, triggers de alertas).
- Buckets esperados (CLI Supabase): `labels`, `albaranes` (privados).
