import { describe, it, expect, beforeEach } from "vitest";
import { resetReceptionsStore, createReception, receivePartial, finalizeReception, listAlerts } from "@/lib/receptions/store";

describe("alerts", () => {
  beforeEach(() => resetReceptionsStore());

  it("emits delay and shortage alerts", () => {
    createReception({ id: "r1", org_id: "org", expected_qty: 5, expected_date: "2026-02-02" });
    receivePartial("r1", 2, "2026-02-03"); // late
    finalizeReception("r1"); // shortage
    const alerts = listAlerts();
    expect(alerts.some((a) => a.type === "delay")).toBe(true);
    expect(alerts.some((a) => a.type === "shortage")).toBe(true);
  });
});

