import { test, expect } from "@playwright/test";

test.describe("events import", () => {
  test("page shows upload form", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /Eventos con import idempotente/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Importar eventos/i })).toBeVisible({ timeout: 1000 });
    await expect(page.getByRole("form", { name: /events-import-form/i })).toBeVisible({ timeout: 1000 });
  });
});
