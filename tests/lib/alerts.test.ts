import { describe, it, expect, beforeEach } from "vitest";
import { resetReceptionsStore, createReception, receivePartial, finalizeReception, listAlerts } from "@/lib/receptions/store";
import { resetTasksStore, addLotWithQuantity } from "@/lib/tasks/store";

describe("alerts", () => {
  beforeEach(() => {
    resetReceptionsStore();
    resetTasksStore();
  });

  it("emits delay and shortage alerts", () => {
    createReception({ id: "r1", org_id: "org", expected_qty: 5, expected_date: "2026-02-02" });
    receivePartial("r1", 2, "2026-02-03"); // late
    finalizeReception("r1"); // shortage
    const alerts = listAlerts();
    expect(alerts.some((a) => a.type === "delay")).toBe(true);
    expect(alerts.some((a) => a.type === "shortage")).toBe(true);
  });

  it("emits delay if finalizado sin recibir y fecha vencida", () => {
    createReception({ id: "r2", org_id: "org", expected_qty: 5, expected_date: "2026-01-01" });
    finalizeReception("r2");
    const alerts = listAlerts().filter((a) => a.reception_id === "r2");
    expect(alerts.some((a) => a.type === "delay")).toBe(true);
    expect(alerts.some((a) => a.type === "shortage")).toBe(true);
  });

  it("emits expiry alert for inventory lots expiring soon", () => {
    addLotWithQuantity({ org_id: "org", product_id: "YOGUR", quantity: 5, expires_at: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10) });
    const alerts = listAlerts();
    expect(alerts.some((a) => a.type === "expiry")).toBe(true);
  });
});
