## Visión y objetivos

- Unificar operaciones de cocina/hotel en un solo cockpit (eventos, previsión, producción, compras, inventario, turnos, tareas).
- Reducir horas manuales de Excel → importaciones rápidas (XLSX/CSV/OCR) y cálculos automáticos.
- Dar visibilidad diaria y a 30 días: calendario por salón, previsión de desayunos, incidencias y tareas próximas.
- Mantener trazabilidad: cada importación tiene hash y fecha; las regeneraciones son idempotentes.

### Principios de diseño
- **Cero copia/pega**: todos los flujos admiten importación directa y OCR como alternativa.
- **Idempotencia**: reimportar reemplaza; no duplica.
- **Offline-friendly stub**: si no hay Supabase, se usa store en memoria para continuar pruebas/demos.

