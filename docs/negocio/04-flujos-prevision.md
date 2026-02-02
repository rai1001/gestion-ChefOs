## Flujo de previsión de desayunos

1) **Importar ocupación/servicios**
   - Archivo típico: `Fecha` en columna A (dd/mm/yyyy), `Desayunos` en columna W.
   - Se normalizan fechas (dd/mm/yy, dd-mm, serial Excel).
   - Se deduplican fechas conservando la última fila.
   - Guardado idempotente (upsert por org_id + fecha).

2) **Visualización**
   - Tarjetas “Próximos 7 días”: previsto, real, delta.
   - Tabla “Delta previsto vs real”: histórico ordenado por fecha.
   - Semana en curso: tabla filtrada (fecha dentro de la semana actual).

3) **Registro de real**
   - Form “Guardar real” actualiza `actual_breakfasts`, recalcula delta.

4) **Reset**
   - Borra dataset de previsión (modo stub); en prod sería truncar tabla/scope org.

