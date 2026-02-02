## Flujo de eventos

1) **Importar matriz** (XLSX 3 meses por hoja):
   - A1 contiene el mes; pestaña contiene el año (ej. `2026-Enero.Marzo`).
   - Filas: día (1-31). Columnas: salones (ROSALIA, PONDAL, CASTELAO, CURROS, CUNQUEIRO, HALL, RESTAURANTE, BAR).
   - Cada celda → evento {fecha, salón, nombre, pax? si presente}.
   - Idempotente: reimportar reemplaza eventos del rango.

2) **Normalización**
   - Fechas: día + mes de cabecera + año de pestaña → ISO.
   - Dedup: clave interna incremental para evitar claves duplicadas al renderizar.

3) **Calendario**
   - Marca días con eventos; lista hasta 3 chips por día; badge “+n” para overflow.
   - Tarjeta de día muestra eventos con pax y tipo.

4) **Menús y hojas**
   - Adjuntar menú desde BD o OCR (archivo/imagen).
   - Generar hoja producción/compras: escalado por pax; agrega compras sugeridas.

5) **Próximos 30 días**
   - Lista de eventos futuros ordenados por fecha; base para dashboard.

