import { test, expect } from "@playwright/test";

test.describe("event sheets", () => {
  test("page shows sheets section", async ({ page }) => {
    await page.goto("/events");
    await expect(page.getByRole("heading", { name: /Adjuntar menú y generar hojas/i })).toBeVisible();
    await expect(page.getByRole("table", { name: /events-table/i })).toBeVisible();
    await expect(page.getByRole("table", { name: /event-sheets-table/i })).toBeVisible();
  });
});
