import { test, expect } from "@playwright/test";

test.describe("event sheets", () => {
  test("page shows sheets section", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /Adjuntar menú y generar hoja/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Listado de eventos/i, exact: true })).toBeVisible();
  });
});
