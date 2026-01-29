import { describe, it, expect, beforeEach } from "vitest";
import { resetStore, upsertEntries, updateActual, listDelta } from "@/lib/forecast/store";

describe("forecast store actuals", () => {
  beforeEach(() => resetStore());

  it("updateActual sets actual_breakfasts and delta reflects it", () => {
    upsertEntries([{ org_id: "org", forecast_date: "2026-02-01", guests: 120, breakfasts: 110 }]);
    updateActual("org", "2026-02-01", 130);
    const delta = listDelta();
    expect(delta[0]).toMatchObject({ actual_breakfasts: 130, delta: 20 });
  });

  it("reset clears entries", () => {
    upsertEntries([{ org_id: "org", forecast_date: "2026-02-01", guests: 120, breakfasts: 110 }]);
    resetStore();
    expect(listDelta()).toHaveLength(0);
  });
});
