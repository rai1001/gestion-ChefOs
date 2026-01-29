# Feature Specification: Cocina Hotels SaaS - Core Modules

**Feature Branch**: `001-cocina-hotels-saas`
**Created**: 2026-01-29
**Status**: Draft
**Input**: SaaS de gestión de cocina para hoteles: previsión desayunos (import Excel idempotente), eventos (import Excel idempotente y OCR futura), menús/recetas/escandallos con alérgenos, producción/mise en place con tareas por turno y etiquetas con caducidad/barcode, compras y recepción con alertas, inventario/lotes, costes/mermas, dashboards KPI, empleados/turnos móvil. Stack: Next.js 14 + TS + Tailwind, Supabase (supabase-js), Vercel. 

## User Scenarios & Testing (mandatory)

### User Story 1 - Previsión desayunos idempotente (Priority: P1)
Como planner, cargo cada día un Excel con previsión de ocupación/desayunos, y puedo sustituir la carga anterior sin duplicar; al cierre comparo previsto vs real.
**Why**: Impacto diario en producción y compras; base de KPIs.
**Independent Test**: Subir Excel de día D dos veces; la segunda reemplaza. Registrar consumo real y ver comparación.
**Acceptance**:
1) Given carga previa día D, When subo Excel nuevo para D, Then reemplaza y no duplica.
2) Given previsión D, When registro real, Then veo delta previsto vs real.

### User Story 2 - Eventos con import idempotente y menú adjunto (Priority: P1)
Como coordinador, importo Excel de eventos (o actualizo en el día) sin duplicar; al abrir evento puedo adjuntar menú desde BD o archivo/imagen (OCR futura) y generar hoja de producción/compras.
**Why**: Impacta previsión, compras y producción inmediata.
**Independent Test**: Importar Excel fecha X dos veces; segunda reemplaza. Generar hoja de producción y compras al adjuntar menú existente.
**Acceptance**:
1) Given eventos cargados fecha X, When reimporto Excel X, Then reemplaza sin duplicar.
2) Given evento con menú BD, When genero hoja de producción/compras, Then calcula cantidades según asistentes y stocks.

### User Story 3 - Producción y mise en place con etiquetas (Priority: P1)
Como chef, veo tareas por turno, inicio/finalizo (sin marcar final directo), genero etiquetas con caducidad y barcode; al crear etiqueta, entra a inventario y se controla caducidad.
**Why**: Control operativo y trazabilidad.
**Independent Test**: Crear tareas, marcar inicio, luego fin; generar etiqueta y verificar alta en inventario con caducidad.
**Acceptance**:
1) Given tareas asignadas, When marco “Iniciar”, Then no puedo marcar “Terminar” sin iniciar y se registra tiempo.
2) Given producto preparado, When genero etiqueta, Then crea lote con caducidad y barcode en inventario.

### User Story 4 - Compras y recepción con alertas (Priority: P1)
Como compras, genero hoja agrupada por proveedor con fecha límite (lead time/días reparto); en recepción comparo pedido vs albarán (foto), alertas por faltantes/retraso, ingreso parcial a inventario.
**Why**: Asegura abastecimiento y exactitud.
**Independent Test**: Hoja de compras muestra fecha límite; recepción muestra faltantes y alerta; al aceptar, crea lotes.
**Acceptance**:
1) Given necesidades calculadas, When genero hoja de compras, Then agrupa por proveedor y fecha límite.
2) Given pedido emitido, When recepciono con faltantes, Then alerta y solo ingresa recibido.

### User Story 5 - Inventario, costes y mermas (Priority: P2)
Como admin/chef, gestiono productos, lotes, ajustes y merma; veo coste teórico vs real por receta/evento; alertas por rotura y caducidad próxima.
**Why**: Control financiero y desperdicio.
**Independent Test**: Registrar merma e impacto en coste real; simular rotura y alerta.
**Acceptance**:
1) Given receta con coste teórico, When registro merma en lote usado, Then coste real se actualiza y se refleja en KPI.
2) Given stock bajo mínimo, When se consume, Then alerta de rotura.

### User Story 6 - Dashboards KPI (Priority: P2)
Como dirección, veo previsión vs real desayunos, coste teórico vs real, roturas, caducidad próxima, margen.
**Why**: Visibilidad ejecutiva.
**Independent Test**: KPI desde vistas/materializadas; mostrar delta y alertas.
**Acceptance**:
1) Given previsión y real, When abro dashboard, Then veo delta y tendencias.
2) Given alertas activas, When abro panel, Then veo resumen y filtros.

### User Story 7 - Empleados y turnos móvil (Priority: P3)
Como empleado, accedo móvil a tareas y turnos; vacaciones/bajas reflejadas; UX responsive.
**Why**: Productividad y adopción móvil.
**Independent Test**: Ver tareas y marcar inicio/fin desde móvil.
**Acceptance**:
1) Given turno asignado, When accedo móvil, Then veo tareas e inicio.
2) Given vacaciones aprobadas, When planifico, Then ajusta tareas/turnos.

### Edge Cases
- Import Excel duplicado mismo día: debe reemplazar, no sumar; si formato inválido, error claro.
- OCR no disponible: usar menú BD/manual y dejar stub para reintento.
- Recepción con albarán incompleto: alertar y no ingresar faltantes; recepción parcial permitida.
- Etiquetas sin caducidad: bloquear creación.
- Rotura de stock en producción: alerta y sugerir sustitutos si existen.
- RLS/ACL: usuarios sin rol no ven otras sedes ni datos restringidos.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: Importar previsión diaria (Excel) por fecha con idempotencia (reemplaza última carga del día).
- **FR-002**: Registrar conteo real de desayunos y mostrar delta vs previsión.
- **FR-003**: Importar eventos (Excel) idempotente; CRUD de eventos en calendario mensual.
- **FR-004**: Adjuntar menú a evento desde BD o archivo/imagen (OCR futura); generar hoja de producción y compras.
- **FR-005**: Menús/recetas/escandallos con alérgenos y coste teórico.
- **FR-006**: Calcular mise en place y tareas por turno; flujo iniciar/terminar tarea.
- **FR-007**: Generar etiquetas con caducidad y barcode; alta en inventario por lote.
- **FR-008**: Hoja de compras agrupada por proveedor con fecha límite según lead time/días reparto.
- **FR-009**: Recepción coteja pedido vs albarán (foto), alertas por faltantes/retraso, ingreso parcial a inventario.
- **FR-010**: Inventario por productos, lotes, unidades; ajustes y merma registrable; consumo desde recetas/eventos.
- **FR-011**: KPI: previsión vs real, coste teórico vs real, roturas, caducidad próxima, margen.
- **FR-012**: Empleados: turnos, vacaciones/bajas, acceso móvil a tareas.

### Key Entities
- **Previsión**: fecha, ocupación/desayunos previstos, versión importación.
- **Evento**: fecha, asistentes, menú asociado, versión importación.
- **Menú/Receta**: ingredientes, alérgenos, coste teórico, raciones.
- **Pedido/Proveedor**: ítems, fechas límite y reparto, estado.
- **Recepción/Albarán**: foto, cantidades recibidas, faltantes, alertas.
- **Inventario/Lote**: producto, cantidad, caducidad, etiquetas/barcode, trazabilidad.
- **Tarea/Producción**: turno, estado, tiempos, responsable.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: Import previsión/eventos completa < 30s y sin duplicados (idempotencia comprobada).
- **SC-002**: Delta previsión vs real disponible el mismo día del cierre.
- **SC-003**: Hoja de compras se genera en < 5s y refleja ≥95% de necesidades.
- **SC-004**: Alerta de faltantes/retraso en < 1 min tras registrar albarán.
- **SC-005**: 100% etiquetas con caducidad válida; 0 etiquetas sin caducidad.
- **SC-006**: Dashboard KPI carga en < 3s usando vistas/materializadas y paginación/filtrado server-side.