import { describe, it, expect, beforeEach } from "vitest";
import { getAlertSummary, getForecastDelta } from "@/lib/dashboards/queries";
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
});
