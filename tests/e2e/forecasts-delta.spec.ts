import { test, expect } from "@playwright/test";

test.describe("forecasts delta", () => {
  test("shows delta table headers", async ({ page }) => {
    await page.goto("/forecasts");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/Delta previsto vs real/i)).toBeVisible();
  });
});
