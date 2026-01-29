import { test, expect } from "@playwright/test";

test.describe("auth", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible();
  });
});
