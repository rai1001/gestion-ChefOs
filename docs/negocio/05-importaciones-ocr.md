## Importaciones y OCR

- **Eventos**: XLSX matriz; OCR no requerido (texto ya estructurado).
- **Previsión**: XLSX/CSV ocupación; sin OCR.
- **Productos**: XLSX (maestro); OCR opcional para facturas/listados.
- **Recetas**: XLSX (escandallos); OCR para imágenes/pdf de recetas.
- **Menús**: OCR (pdf/jpg) para extraer nombre y platos.

### Reglas generales
- Límite archivo 10MB; formatos permitidos: xlsx, csv, jpg, jpeg, png, pdf.
- Idempotencia: hash de archivo por import; reimportar reemplaza filas de la misma fecha/org.
- Validaciones mínimas: fecha válida, columnas requeridas presentes, filas totales ≤ 10k.

