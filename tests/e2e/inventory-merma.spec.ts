import { test, expect } from "@playwright/test";

test.describe("inventory merma", () => {
  test("reduces lot quantity after merma", async ({ request, page }) => {
    // Seed lot via labels store (reuse)
    await request.post("/api/labels", { data: { org_id: "org-e2e", task_id: "t1", expires_at: "2026-06-01" } });
    const lots = await (await request.get("/api/labels")).json();
    const lotId = lots.data?.[0]?.id;
    expect(lotId).toBeTruthy();

    await request.post("/api/inventory/merma", { data: { lot_id: lotId, quantity: 1 } });

    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventario y merma" })).toBeVisible();
    const row = page.getByTestId("inventory-row").first();
    await expect(row).toContainText(lotId);
  });
});

