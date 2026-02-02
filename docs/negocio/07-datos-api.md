## Modelo de datos / API (resumen)

- **events**: org_id, event_date, hall, name, event_type?, attendees, menu_name?, menu_id?
- **event_imports**: org_id, import_date, hash
- **forecasts**: org_id, forecast_date, guests, breakfasts, actual_breakfasts?
- **forecast_imports**: org_id, import_date, hash
- **products**: id, name, unit, price, supplier?
- **recipes**: id, name, items[{product_id, qty, unit_price}]
- **tasks**: id, title, due_date, shift, status, hall?, servings?
- **inventory_lots**: id, product_id, expires_at, quantity

### Endpoints clave
- `POST /api/events/import` (multipart/json), `GET /api/events`
- `POST /api/forecasts/import`, `GET /api/forecasts/delta`, `POST /api/forecasts/real`, `POST /api/forecasts/reset`
- `POST /api/products/import`, `GET /api/products`
- `POST /api/ocr?kind=menu|receta|producto`
- `POST /api/events/:date/attach-menu`, `GET /api/events/:date/sheets`
