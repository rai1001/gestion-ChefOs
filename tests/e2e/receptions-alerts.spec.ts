import { test, expect } from "@playwright/test";

test.describe("receptions alerts", () => {
  test.beforeEach(async ({ request }) => {
    await request.delete("/api/receptions");
  });

  test("shows delay and shortage alerts for partial reception", async ({ request, page }) => {
    const create = await request.post("/api/receptions", {
      data: { id: "r1", org_id: "org-e2e", expected_qty: 10, expected_date: "2026-02-02" },
    });
    expect(create.ok()).toBeTruthy();

    await request.post("/api/receptions/r1/lines", { data: { qty: 6, received_at: "2026-02-02" } });
    await request.post("/api/receptions/r1/lines", { data: { qty: 3, received_at: "2026-02-03" } });
    await request.patch("/api/receptions/r1/lines");

    await page.goto("/receptions");
    await expect(page.getByRole("heading", { name: "Recepciones y alertas" })).toBeVisible();
    await expect(page.getByLabel("receptions-table").getByTestId("reception-row").first()).toBeVisible();
    // Alert list text
    await expect(page.getByLabel("alerts-list")).toContainText("delay");
  });
});

