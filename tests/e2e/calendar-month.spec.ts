import { test, expect } from "@playwright/test";

test.describe("calendar month", () => {
  test("renders grid", async ({ page, request }) => {
    await request.post("/api/events/import", {
      form: { file: Buffer.from("event_date,hall,name,attendees\n2026-02-05,ROSA,Evento QA,50"), filename: "events.csv" },
    } as any);
    await page.goto("/calendar/month");
    await expect(page.getByTestId("calendar-month")).toBeVisible();
  });
});
