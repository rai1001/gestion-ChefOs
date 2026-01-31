import { test, expect } from "@playwright/test";

test.describe("shifts", () => {
  test("shows weekly grid", async ({ page, request }) => {
    await request.post("/api/shifts", { data: { org_id: "org-dev", shift_date: new Date().toISOString().slice(0, 10), shift_code: "morning", status: "scheduled", employee_name: "Turno Chef" } });
    await page.goto("/shifts");
    await expect(page.getByRole("heading", { name: "Calendario semanal" })).toBeVisible();
    await expect(page.getByTestId("shifts-grid")).toBeVisible();
  });
});
