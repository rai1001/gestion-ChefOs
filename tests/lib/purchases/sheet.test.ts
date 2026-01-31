import { describe, it, expect, vi } from "vitest";
import { buildSheet } from "@/lib/purchases/build-sheet";

describe("purchases sheet", () => {
  it("groups by supplier and computes next allowed deadline (fallback lead time)", () => {
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

  it("uses event date + supplier windows to compute order and arrival", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-10T08:00:00Z")); // Tuesday

    const sheet = buildSheet([
      {
        supplier: "Frutas SA",
        product: "Manzana Fuji",
        quantity: 50,
        unit: "kg",
        event_date: "2026-02-20",
        supplier_config: {
          delivery_days: [1, 3, 5], // Mon/Wed/Fri
          cutoff_time: "16:00",
          prep_hours: 12,
          ship_hours: 24,
        },
      },
    ]);

    expect(sheet).toHaveLength(1);
    const frutas = sheet[0];
    expect(frutas.deadline).toBe("2026-02-16"); // order before Monday so it arrives Wed 19? Wait arrival target 18; order 16
    expect(frutas.delivery_eta).toBe("2026-02-18"); // two days before event on an allowed delivery day
    expect(frutas.lines[0].event_date).toBe("2026-02-20");
  });
});
