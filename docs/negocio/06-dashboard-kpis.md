## Dashboard operativo (KPIs)

- Alertas: caducidades ≤7 días + tareas atrasadas.
- Tareas (7d): pendientes/en curso.
- Previsión desayunos (7d): suma prevista próxima semana.
- Caducidades (≤7d): lotes con expiración próxima.
- Próximos eventos (7d): fecha, salón, nombre, pax.
- Alertas recientes: lista de incidencias/imports incompletos.

### Fuentes de datos
- Supabase (prod) / stores en memoria (stub/E2E).
- Endpoints: `/api/dashboards/events/upcoming`, `/api/forecasts/delta`, `/api/lots/expiry`, `/api/tasks`.
