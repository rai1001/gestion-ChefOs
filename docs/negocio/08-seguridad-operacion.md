## Seguridad y operación

- Autenticación: pendiente definir (hoy stub); mínimo soportar Magic Link o OAuth hotel.
- Autorización: scopes por rol (ver personas/roles). Control a nivel de UI y API.
- Auditoría: registrar import_date, hash y usuario de importación.
- Backups: diarios en Supabase; en modo stub no hay persistencia (solo memoria).
- Límites: tamaño archivo 10MB; 10k filas por import; tiempo espera 30s.
- Idempotencia: upsert por org_id+fecha (+hall para eventos).
- Protección frente a duplicados UI: keys únicas en renders; dedup en parser antes de persistir.

