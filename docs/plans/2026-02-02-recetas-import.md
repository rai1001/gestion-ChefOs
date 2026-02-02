# Importación de Recetas/Hoja de Producción desde Excel y OCR (Mistral) – Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permitir cargar recetas/escandallos desde Excel u OCR (Mistral) para generar fichas de receta con líneas de producto (producto, cantidad, precio) y cálculos de coste. Usar esos datos tanto para hoja de producción (cantidades necesarias) como para hoja de compras (sumar cantidades y multiplicar por precio de “productos”, independientes de inventario).

**Architecture:** API App Router con endpoints `/api/recipes` y `/api/recipes/import` (XLSX/CSV) + reutilizar `/api/ocr?kind=recipe` para PDF/JPG → parser tabular. Datos persistidos en Supabase (o stores E2E) en tablas `recipes` y `recipe_items`; catálogo `products` usado solo para precio/unidad. Helpers para calcular coste total y coste por ración. UI mínima de importación (upload + resultados) en `/recipes/import`. Tests Vitest para parser y cálculos; Playwright para flujo de importación.

**Tech Stack:** Next.js App Router, Supabase client/admin, `xlsx` parser ya instalado, OCR existente (Mistral Vision), Vitest, Playwright.

---

### Task 1: Modelo de datos y stores

**Files:**
- Modify: `supabase/migrations/*.sql` (añadir tablas) o `src/lib/recipes/store.ts` (stub E2E)
- Modify: `src/lib/products/store.ts` (asegurar precios disponibles)
- Tests: `tests/lib/recipes/store.test.ts`

**Steps:**
1. Tablas: `recipes(id, org_id, name, date?, servings)`; `recipe_items(id, recipe_id, product_name, unit, gross_qty, net_qty, waste_qty, waste_pct, unit_price, total_cost)`. `products` ya existente? si no, añadir tabla mínima `products(id, org_id, name, unit, unit_price)`.
2. Store functions: `upsertRecipeWithItems`, `listRecipes`, `getRecipe(id)`, stub E2E in-memory.
3. Tests: crear receta con 2 ítems, validar totales y roundings.

### Task 2: Parser Excel/CSV

**Files:**
- Add: `src/lib/recipes/import.ts`
- Tests: `tests/lib/recipes/import.test.ts` (fixtures .xlsx/.csv en `tests/fixtures/recipes/`)

**Steps:**
1. Leer XLSX hoja 1; mapear columnas del ejemplo: `DESCRIPCIÓN PRODUCTO PROVEEDOR`→product_name, `UNIDADES`→unit, `CANTIDAD BRUTA/NETA`→gross_qty/net_qty, `% DESPERDICIO`→waste_pct, `PRECIO POR UNIDAD`→unit_price; `TOTAL` opcional se recalcula.
2. Normalizar número decimal con coma/punto; ignorar filas vacías o “SELECCIONAR UNA BASE RECETA”.
3. Devolver `RecipeImport { name, date?, servings?, items[] }`.
4. Tests: parse de fixture (tortilla) y comprobar 5 líneas + coste total calculado.

### Task 3: Endpoints API

**Files:**
- Add: `src/app/api/recipes/import/route.ts`
- Add: `src/app/api/recipes/route.ts` (GET list, POST create manual)
- Modify: `src/app/api/ocr/route.ts` (aceptar `kind=recipe` y enviar a parser)
- Tests: `tests/api/recipes.import.test.ts` (Vitest request) + adjust E2E stores

**Steps:**
1. `/api/recipes/import` POST multipart (file) o JSON `{ rows:[...] }`; usa parser y guarda via store; responde con resumen de costes.
2. `/api/recipes` GET (lista) y POST (JSON RecipeImport).
3. OCR: cuando `kind=recipe`, parsear texto tabular de Mistral Vision → rows → parser.
4. Tests: mock Supabase/store; subir fixture xlsx; esperar 201 y totals > 0.

### Task 4: Cálculos y helpers

**Files:**
- Add: `src/lib/recipes/calc.ts`
- Tests: `tests/lib/recipes/calc.test.ts`

**Steps:**
1. Función `computeItemTotals(item)` → waste_qty si falta, net_qty si falta, total_cost = net_qty * unit_price.
2. `computeRecipeCost(recipe)` → suma total, coste_por_racion = total/servings.
3. Tests con casos de porcentaje y cantidades cero.

### Task 5: UI Importación / Recipes

**Files:**
- Add: `src/app/(app)/recipes/import/page.tsx`
- Add: `src/app/(app)/recipes/page.tsx` (lista)
- Tests: `tests/e2e/recipes-import.spec.ts`

**Steps:**
1. Página de import: dropzone input file + botón “Importar Excel/OCR”; mostrar tabla previa (primeras 10 filas) y resumen de coste.
2. Soportar carga de imagen/PDF → llama `/api/ocr?kind=recipe`.
3. Lista de recetas: nombre, fecha, raciones, coste total y por ración.
4. E2E: subir fixture xlsx, ver receta listada y total mostrado.

### Task 6: Integración con hoja de compras/producción

**Files:**
- Modify: `src/lib/purchases/sheet.ts` (si existe) para aceptar items desde receta (net_qty * servings deseadas)
- Modify: `src/lib/production/sheet.ts` (si existe) para same
- Tests: `tests/lib/purchases/from-recipes.test.ts`

**Steps:**
1. Helper `expandRecipe(recipe, targetServings)` → items agrupados por producto con cantidades netas.
2. Alimentar hoja de compras existente sumando cantidades y multiplicando por `products.unit_price`.
3. Test: receta con 2 items → sheet agrega cantidades y totales.

### Task 7: Documentación

**Files:**
- Update: `docs/api-contracts.md` (endpoints recipes + OCR recipe)
- Add: `docs/howto/recipes-import.md` (pasos y formato de Excel)

**Steps:**
1. Especificar columnas requeridas, ejemplo de CSV, y uso de OCR.
2. Describir respuestas de APIs y códigos de error.

### Task 8: Verificación y commit

**Steps:**
1. `pnpm test` (unit)
2. `pnpm e2e -- --project=chromium --grep "recipes"`
3. `git status` y `git commit -m "feat(recipes): import from excel/ocr"`

---

Notas de mapping desde Excel de ejemplo (escandallo):
- Nombre receta: celda B4/B5
- Fecha: celda B7 (si viene)
- Servings: “Nº RACIONES…” celda H7
- Items desde fila 13 en adelante: columnas A=product_name, F=unit, G=gross_qty, H=net_qty, I=waste_qty, J=waste_pct, K=unit_price (sin símbolo €), L=total (recalcular).
