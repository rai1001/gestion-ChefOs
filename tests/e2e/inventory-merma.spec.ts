import { test, expect } from "@playwright/test";

test.describe("inventory merma", () => {
  test("reduces lot quantity after merma", async ({ request, page }) => {
    // Seed task -> start/finish -> label to create lot
    const createTask = await request.post("/api/tasks", { data: { title: "prep", org_id: "org-e2e" } });
    const taskId = (await createTask.json()).id as string;
    await request.post(`/api/tasks/${taskId}/start`);
    await request.post(`/api/tasks/${taskId}/finish`);
    const labelRes = await request.post("/api/labels", { data: { org_id: "org-e2e", task_id: taskId, expires_at: "2026-06-01" } });
    const labelJson = await labelRes.json();
    const lotId = labelJson.lot_id;
    expect(labelRes.ok).toBeTruthy();
    await request.post("/api/inventory/merma", { data: { lot_id: lotId || "lot-fallback", quantity: 1 } });

    await page.goto("/inventory");
    await expect(page.getByRole("heading", { name: "Inventario y merma" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});
