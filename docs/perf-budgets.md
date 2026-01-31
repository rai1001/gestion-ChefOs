# Performance Budgets – Cocina Hotels Core

Date: 2026-01-29  
Scope: P1 features (previsión, eventos, compras/recepción, producción, inventario), dashboards/alerts stubs.

## Budgets (objetivo producción)
- Importaciones previsión/eventos: **< 30s** E2E por archivo (hash + upsert idempotente).
- Dashboards KPIs: **< 3s TTI** para gráficos principales (scoped por `org_id`).
- Alertas/cron: **< 1 min** desde el evento hasta que aparece la alerta (retraso/falta recepción, merma, caducidad/rotura).
- Hoja de compras: **< 2s** para ≤500 líneas agrupadas por proveedor.
- Recepciones/Inventario UI: **< 1.5s** primer render (SSR/server components).

## Palancas técnicas
- Vistas/materializadas: `forecast_delta`, `kpi_alert_counts`; refrescar vía RPC/cron (`/api/cron/refresh-dashboards`).
- Índices y RLS definidos en `supabase/migrations/20260129_core_schema.sql` (org_id + fechas).
- Next.js App Router: server components para listados; caché/dedupe fetch; streaming en dashboards.
- Alertas via triggers (reception delay/shortage, merma, caducidad/rotura, pedido vencido).

## Measurement
- Local E2E: `corepack pnpm e2e` (Playwright config ya setea `NEXT_PUBLIC_E2E=1`).
- Medir tiempos de import y dashboards con timers en Vitest al apuntar a Supabase real antes de despliegue.
