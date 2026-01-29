import { test, expect } from "@playwright/test";

test.describe("purchases sheet", () => {
  test("groups by supplier and shows deadline", async ({ request, page }) => {
    await request.post("/api/purchases/sheet", {
      data: {
        items: [
          { supplier: "A", product: "Huevos", quantity: 30, unit: "ud", lead_time_days: 2, delivery_days: [1, 3, 5] },
          { supplier: "B", product: "Pan", quantity: 10, unit: "kg", lead_time_days: 1 },
        ],
      },
    });

    await page.goto("/purchases");
    await expect(page.getByRole("heading", { name: "Hoja de compras" })).toBeVisible();
    await expect(page.getByLabel("purchases-table").getByTestId("supplier-row").first()).toBeVisible();
  });
});

