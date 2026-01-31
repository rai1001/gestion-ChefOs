import { test, expect } from "@playwright/test";

test.describe("employees", () => {
  test("list employees", async ({ page, request }) => {
    // seed hotel and employee
    await request.post("/api/hotels", { data: { name: "Hotel Seed", org_id: "org-dev" } });
    await request.post("/api/employees", { data: { name: "Empleado Seed", role: "chef", org_id: "org-dev" } });

    await page.goto("/employees");
    await expect(page.getByRole("heading", { level: 1, name: "Empleados" })).toBeVisible();
    await expect(page.getByTestId("employee-list")).toBeVisible();
  });
});
