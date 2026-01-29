import { test, expect } from "@playwright/test";

test.describe("tasks + labels flow", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete("/api/tasks");
  });

  test("start, finish and label a task creates inventory lot", async ({ page, request }) => {
    const createRes = await request.post("/api/tasks", { data: { title: "Mise en place", org_id: "org-e2e" } });
    const created = await createRes.json();
    const taskId = created.id as string;

    await request.post(`/api/tasks/${taskId}/start`);
    await request.post(`/api/tasks/${taskId}/finish`);
    const labelRes = await request.post("/api/labels", {
      data: { task_id: taskId, org_id: "org-e2e", expires_at: "2026-05-01" },
    });
    const label = await labelRes.json();

    await page.goto("/tasks");
    await expect(page.getByRole("heading", { name: "Producción y etiquetas" })).toBeVisible();
    await expect(page.getByTestId("task-row").first()).toContainText("Mise en place");
    await expect(page.getByTestId("task-row").first()).toContainText("done");
    await expect(page.getByTestId("lot-row").first()).toContainText(label.label_id);
    await expect(page.getByTestId("lot-row").first()).toContainText("2026-05-01");
  });
});
