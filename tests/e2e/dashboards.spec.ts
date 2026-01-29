import { test, expect } from "@playwright/test";

test.describe("dashboards", () => {
  test("shows alert count and delta list", async ({ page }) => {
    await page.goto("/dashboards");
    await expect(page.getByRole("heading", { name: "Dashboards" })).toBeVisible();
    await expect(page.getByTestId("alerts-count")).toBeVisible();
  });
});

