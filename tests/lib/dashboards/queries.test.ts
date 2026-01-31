import { describe, it, expect, beforeEach } from "vitest";
import { getAlertSummary, getForecastDelta, getUpcomingTasks, getAlerts, getBreakfastForecast } from "@/lib/dashboards/queries";
import { resetTasksStore, seedTask } from "@/lib/tasks/store";

describe("dashboards queries (E2E stub)", () => {
  beforeEach(() => {
    resetTasksStore();
    seedTask({
      id: "over-1",
      org_id: "org-test",
      title: "Overdue",
      status: "pending",
      due_date: "2026-01-01",
      shift: "morning",
      priority: "high",
    } as any);
  });

  it("returns alert summary stub", async () => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const res = await getAlertSummary("org-test");
    expect(res[0].alert_count).toBeGreaterThanOrEqual(0);
  });

  it("returns forecast delta stub", async () => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    const res = await getForecastDelta("org-test");
    expect(res[0].forecast_date).toBeDefined();
  });

  it("returns upcoming tasks stub", async () => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
    const res = await getUpcomingTasks("org-test", 7);
    expect(Array.isArray(res)).toBe(true);
  });

  it("returns alerts list stub", async () => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
    const res = await getAlerts("org-test");
    expect(res.length).toBeGreaterThan(0);
  });

  it("returns breakfast forecast stub", async () => {
    process.env.NEXT_PUBLIC_E2E = "1";
    process.env.E2E = "1";
    const res = await getBreakfastForecast("org-test", 7);
    expect(res.length).toBeGreaterThan(0);
  });
});
