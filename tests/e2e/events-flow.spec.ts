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
    const filePath = buildEventsWorkbook();

    await page.goto('/events');

    // Importar XLSX
    await page.getByLabel('Archivo Eventos').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Subir / Reimportar' }).click();

    // Esperar a que aparezcan las filas importadas
    await expect(page.getByRole('cell', { name: 'ROSALIA' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'PONDAL' })).toBeVisible();

    // Seleccionar fecha y salón
    await page.getByLabel('Fecha evento').fill('2026-02-10');
    await page.getByLabel('Salón seleccionado').selectOption('ROSALIA');

    // Adjuntar menú y generar hoja
    await page.getByRole('button', { name: /Adjuntar menú/i }).click();
    await page.getByRole('button', { name: /Generar hoja/ }).click();

    // Validar hoja generada para el salón
    const sheetTable = page.getByRole('table', { name: 'event-sheets-table' });
    await expect(sheetTable.getByRole('cell', { name: '2026-02-10' })).toBeVisible();
    await expect(sheetTable.getByRole('cell', { name: '120' })).toBeVisible();
  });
});

