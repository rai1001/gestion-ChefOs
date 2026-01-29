import { test, expect } from "@playwright/test";

test.describe("mobile turnos", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete("/api/turnos");
  });

  test("shows shift blocked by vacation", async ({ request, page }) => {
    await request.post("/api/turnos", {
      data: { name: "Mañana", org_id: "org-e2e", shift_date: "2026-02-02", vacation: true },
    });

    await page.goto("/mobile/turnos");
    await expect(page.getByRole("heading", { name: "Turnos y tareas" })).toBeVisible();
    await expect(page.getByTestId("shift-card")).toContainText("Bloqueado por vacaciones/baja");
  });
});

