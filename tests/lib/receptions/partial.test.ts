import { describe, it, expect, beforeEach, vi } from "vitest";
import { createReception, receivePartial, finalizeReception, resetReceptionsStore, listAlerts } from "@/lib/receptions/store";

describe("receptions partial", () => {
  beforeEach(() => {
    resetReceptionsStore();
    vi.useRealTimers();
  });

  it("records partial intake, flags delay and shortage", () => {
    createReception({ id: "r1", org_id: "org", expected_qty: 10, expected_date: "2026-02-02" });

    const first = receivePartial("r1", 6, "2026-02-02");
    expect(first.received_qty).toBe(6);
    expect(first.status).toBe("partial");

    const second = receivePartial("r1", 3, "2026-02-03");
    expect(second.received_qty).toBe(9);
    expect(listAlerts().some((a) => a.type === "delay")).toBe(true);

    const finalized = finalizeReception("r1");
    expect(finalized.status).toBe("partial");
    const alerts = listAlerts();
    expect(alerts.some((a) => a.type === "shortage")).toBe(true);
  });
});

