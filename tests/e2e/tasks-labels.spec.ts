import { test, expect } from "@playwright/test";

test.describe("tasks + labels flow", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete("/api/tasks");
  });

  test("start, finish and label a task creates inventory lot", async ({ page, request }) => {
    const createRes = await request.post("/api/tasks", { data: { title: "Mise en place", org_id: "org-e2e", due_date: "2026-02-01", shift: "morning" } });
    const created = await createRes.json();
    const taskId = created.id as string;

    await request.post(`/api/tasks/${taskId}/start`);
    await request.post(`/api/tasks/${taskId}/finish`);
    const labelRes = await request.post("/api/labels", {
      data: { task_id: taskId, org_id: "org-e2e", expires_at: "2026-05-01" },
    });
    await labelRes.json();

    await page.goto("/tasks");
    await expect(page.getByRole("heading", { name: "Producción y etiquetas" })).toBeVisible();
    const row = page.getByTestId("task-row").filter({ hasText: "Mise en place" }).first();
    await expect(row).toBeVisible();
    await expect(page.getByTestId("lot-row").first()).toBeVisible({ timeout: 5000 });
  });
});
