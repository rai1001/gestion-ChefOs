import { test, expect } from "@playwright/test";

test.describe("hotels", () => {
  test("create and list hotels", async ({ page }) => {
    // seed via API to avoid overlay issues
    await page.request.post("/api/hotels", { data: { name: "Hotel Playwright", org_id: "org-dev" } });
    await page.goto("/hotels");
    await expect(page.getByRole("heading", { name: "Hoteles" })).toBeVisible();
    await expect(page.getByTestId("hotel-list")).toBeVisible();
  });
});
