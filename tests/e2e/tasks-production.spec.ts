import { test, expect } from "@playwright/test";

const baseDate = "2026-02-01";

test.describe("tasks production flow", () => {
  test("start and finish a production task", async ({ page, request }) => {
    // seed a task via API (E2E mode)
    await request.post("/api/tasks", {
      data: {
        org_id: "org-e2e",
        title: "Tarea producción e2e",
        due_date: baseDate,
        shift: "morning",
        priority: "high",
        hall: "Castelao",
        servings: 40,
      },
    });

    await page.goto("/tasks");
    const row = page.getByTestId("task-row").filter({ hasText: "Tarea producción e2e" }).first();

    await expect(row).toBeVisible();
    await row.getByRole("button", { name: /Empezar/i }).click();
    await expect(row.getByText(/in_progress/i)).toBeVisible();

    await row.getByRole("button", { name: /Terminar/i }).click();
    await expect(row.getByText(/done/i)).toBeVisible();
  });
});
