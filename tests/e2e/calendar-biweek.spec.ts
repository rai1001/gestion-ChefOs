import { test, expect } from "@playwright/test";

test.describe("calendar biweek", () => {
  test("renders and shows shift", async ({ page, request }) => {
    const today = new Date().toISOString().slice(0, 10);
    await request.post("/api/employees", { data: { name: "Biweek Tester", role: "chef", org_id: "org-dev" } });
    await request.post("/api/shifts", { data: { org_id: "org-dev", shift_date: today, shift_code: "M", status: "scheduled", employee_name: "Biweek Tester" } });
    await page.goto("/calendar/biweek");
    await expect(page.getByText("Biweek Tester").first()).toBeVisible();
    await expect(page.getByTestId(`cell-Biweek Tester-${today}`)).toBeVisible();
  });
});
