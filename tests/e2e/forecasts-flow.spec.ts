import { test, expect } from "@playwright/test";

const rows = [
  { forecast_date: "2026-02-01", guests: 150, breakfasts: 140 },
];

async function reset(api: any) {
  await api.post("/api/forecasts/reset");
}

test.describe("forecasts flow", () => {
  test.beforeEach(async ({ request }) => {
    await reset(request);
  });

  test("import + real updates delta", async ({ page, request }) => {
    await request.post("/api/forecasts/import", {
      data: { org_id: "org-e2e", rows },
      headers: { "x-org-id": "org-e2e" },
    });

    await request.post("/api/forecasts/real", {
      data: { org_id: "org-e2e", forecast_date: "2026-02-01", actual_breakfasts: 130 },
    });

    await page.goto("/forecasts");
    const row = page.getByTestId("delta-row");
    await expect(row).toContainText("2026-02-01");
    await expect(row).toContainText("140");
    await expect(row).toContainText("130");
    await expect(row).toContainText("-10");
  });
});
