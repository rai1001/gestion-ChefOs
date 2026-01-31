import { test, expect } from "@playwright/test";

test.describe("calendar week", () => {
  test("shows weekly table", async ({ page, request }) => {
    await request.post("/api/employees", { data: { name: "Semana Tester", role: "chef", org_id: "org-dev" } });
    await request.post("/api/shifts", { data: { org_id: "org-dev", shift_date: new Date().toISOString().slice(0, 10), shift_code: "morning", status: "scheduled", employee_name: "Semana Tester" } });
    await page.goto("/calendar/week");
    await expect(page.getByTestId("calendar-week")).toBeVisible();
  });
});
