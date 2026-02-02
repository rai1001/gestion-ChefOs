import { describe, it, expect } from "vitest";
import { computeItemTotals, computeRecipeCost } from "@/lib/recipes/calc";

describe("recipes calc", () => {
  it("computes waste and totals", () => {
    const item = computeItemTotals({ product_name: "Patata", unit: "KG", gross_qty: 1, unit_price: 2 });
    expect(item.net_qty).toBe(1);
    expect(item.waste_pct).toBe(0);
    expect(item.total_cost).toBe(2);
  });

  it("computes cost per serving", () => {
    const { cost_per_serving, total_cost } = computeRecipeCost(
      [
        { id: "1", product_name: "A", unit: "KG", gross_qty: 1, net_qty: 0.9, waste_qty: 0.1, waste_pct: 10, unit_price: 3, total_cost: 2.7 },
      ],
      9
    );
    expect(total_cost).toBeCloseTo(2.7, 5);
    expect(cost_per_serving).toBeCloseTo(0.3, 5);
  });
});
