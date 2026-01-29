# Cocina Hotels SaaS Constitution

## Core Principles

### I. Calidad y testing pragmático
- Cobertura mínima: unidades para lógica de negocio y utilidades; integración para endpoints críticos; smoke E2E para flujos principales (previsión, eventos, compras/recepción, producción, inventario).  
- TDD donde haya reglas de negocio (idempotencia de importaciones, cálculo de mise en place, cotejo pedido vs albarán).  
- No se despliega funcionalidad sin chequeos automatizados básicos.

### II. Seguridad y datos
- Supabase con RLS por rol (admin, chef, sala, staff móvil) y por sede/hotel.  
- Mínimo PII; logs sin datos sensibles; credenciales y tokens fuera del repo.  
- RBAC aplicado en server actions/route handlers y en SQL/RPC.

### III. Dominio y trazabilidad
- Idempotencia en importaciones (previsión, eventos, menús/recetas): última carga del día reemplaza, no suma.  
- Trazabilidad de inventario por lote, etiqueta y caducidad; consumo registrado desde recetas/eventos/producción.  
- Alertas: faltantes en recepción vs pedido, retrasos, caducidad próxima, roturas de stock.

### III.b Extensiones de dominio (enero 2026)
- Previsión de ocupación: importar XLSX/CSV diarios (cols: fecha, desayunos); cada fecha se sobrescribe, no se acumula; permitir edición manual de desayunos reales; el dashboard muestra los próximos 7 días.  
- Eventos: importar Excel trimestral tipo matriz (fila 1 salones, col A días; celdas "Nombre | Tipo | PAX"); clave idempotente por fecha+salón, un evento en varios salones se consolida sin duplicar; vista mensual y lista de próximos eventos; al seleccionar evento se puede adjuntar menú (base de datos u OCR) y generar hojas de compras y producción.  
- Compras/producción: las hojas usan recetas asociadas al menú y el pax del evento; productos bloqueados si ya hay stock en inventario; proveedores con fecha comprometida y notas.  
- UX: no usar datos de demo en entornos productivos; estados vacíos siempre dejan acción disponible (importar, crear, adjuntar).  
- Observabilidad: cada importación registra import_id y conteos procesados/omitidos en logs.

### IV. Performance y fiabilidad
- Consultas sobre vistas/materializadas para dashboards; paginación/filtrado en server.  
- Degradación aceptable en móvil; respuestas server-side priorizadas.  
- Backoff y reintentos para importaciones y escritura en Supabase.

### V. Observabilidad y simplicidad
- Logging estructurado en server actions; IDs de correlación por importación/evento.  
- Métricas básicas: tiempos de import, ratio fallos, alertas generadas, uso por módulo.  
- Preferir soluciones simples (supabase-js) antes que añadir capas extra; añadir Drizzle solo si el tipado lo exige.

## Requisitos y restricciones
- Stack: Next.js 14 (App Router) + TS + Tailwind; supabase-js sin Drizzle; deploy Vercel; Supabase Postgres/Auth/Storage.  
- OCR: placeholder inicialmente; integración futura (Tesseract/servicio externo).  
- Mobile-first para personal de cocina/sala.  
- Importaciones Excel diarias (previsión, eventos) idempotentes; se almacena “versión de importación” por fecha.

## Flujo de desarrollo y calidad
- Uso de slash commands: `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`; opcionales `/speckit.clarify`, `/speckit.analyze`, `/speckit.checklist`.  
- Branches por feature; PR con revisión y checklist de principios.  
- Lint/format/test antes de merge.  
- Migraciones/SQL versionadas; cambios de esquema requieren compatibilidad o migración clara.

## Gobernanza
- Esta constitución prima sobre otras guías locales.  
- Cambios requieren documento de enmienda y acuerdo del responsable de dominio.  
- Toda revisión debe validar cumplimiento de estos principios y restricciones.
