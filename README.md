# Cocina Hotels Core

Next.js (App Router) + Supabase SSR. P1 features: previsión desayunos, eventos, producción con etiquetas, compras/recepción, inventario/merma, alertas stubs.

## Requisitos
- Node 20+, Corepack habilitado (`npm i -g corepack` si no lo tienes).
- Variables Supabase en `.env.local` o en entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - (Server) `SUPABASE_SERVICE_ROLE` si se usan funciones de servicio.
- Para modo E2E/local stub: `NEXT_PUBLIC_E2E=1` y `E2E=1` (omite Supabase; usa stores en memoria).

## Scripts clave
```bash
corepack pnpm dev        # arranca Next
corepack pnpm test       # Vitest
corepack pnpm e2e        # Playwright (usa NEXT_PUBLIC_E2E=1 E2E=1 desde config)
```

## Rutas principales
- UI: `/forecasts`, `/events`, `/tasks`, `/purchases`, `/receptions`, `/inventory`
- API: ver `docs/api-contracts.md`

## Migraciones/seguridad
- Esquema en `supabase/migrations/20260129_core_schema.sql` con RLS por `org_id`, políticas por rol y triggers de alertas (retraso/shortage, merma, caducidad/rotura, pedido vencido).
- Storage buckets esperados (crear vía CLI): `labels`, `albaranes` (privados).

## Performance budgets
Ver `docs/perf-budgets.md` (imports <30s, dashboards <3s, alertas <1m).

## Estado de test actual
- Vitest: OK.
- Playwright (stub/E2E): OK (`corepack pnpm e2e`).
