import { describe, it, expect } from "vitest";
import { applyMerma } from "@/lib/inventory/costing";

describe("inventory costing", () => {
  it("reduces quantity and computes lost cost", () => {
    const lot = { id: "l1", org_id: "org", product_id: "p1", quantity: 10, unit_cost: 50 };
    const { updated, lostCost } = applyMerma(lot, { lot_id: "l1", quantity: 3 });
    expect(updated.quantity).toBe(7);
    expect(lostCost).toBe(150);
  });

  it("throws when merma exceeds quantity", () => {
    const lot = { id: "l1", org_id: "org", product_id: "p1", quantity: 5, unit_cost: 100 };
    expect(() => applyMerma(lot, { lot_id: "l1", quantity: 6 })).toThrow();
  });
});

