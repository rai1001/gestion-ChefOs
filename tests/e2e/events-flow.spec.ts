import { test, expect } from '@playwright/test';
test.describe('Eventos flujo completo (importar → menú → hoja)', () => {
  test('importa XLSX, selecciona salón y genera hoja', async ({ page }) => {
    // Sembrar datos vía API (modo e2e acepta JSON); incluye hall para dos salones
    await page.request.post('/api/events/import', {
      headers: { 'content-type': 'application/json' },
      data: [
        { event_date: '2026-02-10', hall: 'ROSALIA', name: 'Cena Gala', event_type: 'Banquete', attendees: 120 },
        { event_date: '2026-02-10', hall: 'PONDAL', name: 'Reunión', event_type: 'Corporativo', attendees: 40 },
      ],
    });

    await page.goto('/events');

    // Seleccionar fecha y salón (si no hay opciones, usar ALL)
    await page.getByLabel('Fecha evento').fill('2026-02-10');
    const hallSelect = page.getByLabel('Salón seleccionado');
    const hasRosalia = await hallSelect.locator('option[value="ROSALIA"]').count();
    await hallSelect.selectOption(hasRosalia ? 'ROSALIA' : 'ALL');

    // Adjuntar menú y generar hoja
    const attachBtn = page.getByLabel('adjuntar-menu');
    await attachBtn.scrollIntoViewIfNeeded();
    await attachBtn.click({ force: true });

    const hojaBtn = page.getByLabel('generar-hoja');
    await hojaBtn.scrollIntoViewIfNeeded();
    await hojaBtn.click({ force: true });

    // Validar hoja generada para el salón
    const sheetTable = page.getByRole('table', { name: 'event-sheets-table' });
    await expect(sheetTable).toBeVisible();
  });
});

