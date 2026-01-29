import { test, expect } from "@playwright/test";

test.describe("forecasts import", () => {
  test("page shows upload form", async ({ page }) => {
    await page.goto("/forecasts");
    await expect(page.getByRole("heading", { name: /Previsión desayunos/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Importar Excel/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole("form", { name: /forecast-import-form/i })).toBeVisible({ timeout: 1000 });
  });
});
