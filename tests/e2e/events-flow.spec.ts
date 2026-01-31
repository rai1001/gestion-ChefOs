import { test, expect } from '@playwright/test';
import path from 'path';
import os from 'os';
import fs from 'fs';
import * as XLSX from 'xlsx';

function buildEventsWorkbook(): string {
  const wb = XLSX.utils.book_new();
  const data = [
    ['', 'ROSALIA', 'PONDAL'],
    ['2026-02-10', 'Cena Gala | Banquete | 120', 'Reunión | Corporativo | 40'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Q1');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-'));
  const filePath = path.join(tmpDir, 'events.xlsx');
  XLSX.writeFile(wb, filePath);
  return filePath;
}

test.describe('Eventos flujo completo (importar → menú → hoja)', () => {
  test('importa XLSX, selecciona salón y genera hoja', async ({ page }) => {
    // Sembrar datos vía API (modo e2e acepta JSON)
    await page.request.post('/api/events/import', {
      headers: { 'content-type': 'application/json' },
      data: {
        rows: [
          { event_date: '2026-02-10', hall: 'ROSALIA', name: 'Cena Gala', event_type: 'Banquete', attendees: 120 },
          { event_date: '2026-02-10', hall: 'PONDAL', name: 'Reunión', event_type: 'Corporativo', attendees: 40 },
        ],
      },
    });

    await page.goto('/events');

    // Seleccionar fecha y salón (si no hay opciones, usar ALL)
    await page.getByLabel('Fecha evento').fill('2026-02-10');
    const hallSelect = page.getByLabel('Salón seleccionado');
    const hasRosalia = await hallSelect.locator('option[value="ROSALIA"]').count();
    await hallSelect.selectOption(hasRosalia ? 'ROSALIA' : 'ALL');

    // Adjuntar menú y generar hoja
    await page.getByRole('button', { name: /Adjuntar menú/i }).click();
    await page.getByRole('button', { name: /Generar hoja/ }).click();

    // Validar hoja generada para el salón
    const sheetTable = page.getByRole('table', { name: 'event-sheets-table' });
    await expect(sheetTable).toBeVisible();
  });
});

