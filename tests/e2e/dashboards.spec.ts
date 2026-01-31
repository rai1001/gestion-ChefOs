import { test, expect } from "@playwright/test";

test.describe("dashboards", () => {
  test("shows 4 cards and lists", async ({ page }) => {
    await page.goto("/dashboards");
    await expect(page.getByRole("heading", { name: "Dashboard operativo" })).toBeVisible();
    await expect(page.getByTestId("card-alerts")).toBeVisible();
    await expect(page.getByTestId("card-tasks")).toBeVisible();
    await expect(page.getByTestId("card-forecast")).toBeVisible();
    await expect(page.getByTestId("card-expiry")).toBeVisible();

    await expect(page.getByTestId("list-alerts")).toBeVisible();
    await expect(page.getByTestId("list-events")).toBeVisible();
    await expect(page.getByTestId("list-expiry")).toBeVisible();
    await expect(page.getByTestId("list-tasks")).toBeVisible();
  });
});
