import { describe, it, expect, vi } from "vitest";
import { buildSheet } from "@/lib/purchases/build-sheet";

describe("purchases sheet", () => {
  it("groups by supplier and computes next allowed deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T08:00:00Z")); // Sunday

    const sheet = buildSheet(
      [
        { supplier: "A", product: "Huevos", quantity: 30, unit: "ud", lead_time_days: 2, delivery_days: [1, 3, 5] },
        { supplier: "A", product: "Leche", quantity: 10, unit: "L", lead_time_days: 2, delivery_days: [1, 3, 5] },
        { supplier: "B", product: "Pan", quantity: 20, unit: "kg", lead_time_days: 1 },
      ],
      new Date()
    );

    expect(sheet).toHaveLength(2);
    const supplierA = sheet.find((s) => s.supplier === "A")!;
    // Lead time 2 days from Sunday -> Tuesday, next allowed day in [Mon,Wed,Fri] => Wednesday 2026-02-04
    expect(supplierA.deadline).toBe("2026-02-04");
    expect(supplierA.lines).toHaveLength(2);

    const supplierB = sheet.find((s) => s.supplier === "B")!;
    // Lead time 1 day from Sunday -> Monday 2026-02-02
    expect(supplierB.deadline).toBe("2026-02-02");
  });
});

