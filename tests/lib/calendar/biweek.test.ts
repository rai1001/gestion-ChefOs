import { describe, it, expect } from "vitest";
import { buildBiweek, mapShiftsByEmployee } from "@/lib/calendar/biweek";

describe("biweek helpers", () => {
  it("builds two quincenas of 15 days each", () => {
    const start = new Date("2026-02-01T00:00:00Z");
    const b = buildBiweek(start);
    expect(b.quincena1).toHaveLength(15);
    expect(b.quincena2).toHaveLength(15);
    expect(b.rangeStart).toBe("2026-02-01");
    expect(b.rangeEnd).toBe("2026-03-02");
    expect(b.quincena1[0].dayLabel).toBe("1");
  });

  it("maps shifts by employee and date", () => {
    const map = mapShiftsByEmployee([
      { employee_name: "Ana", shift_date: "2026-02-01", shift_code: "M" },
      { employee_name: "Ana", shift_date: "2026-02-02", shift_code: "T" },
      { employee_name: "Luis", shift_date: "2026-02-01", shift_code: "V" },
    ] as any);
    expect(map.Ana["2026-02-01"]).toBe("M");
    expect(map.Ana["2026-02-02"]).toBe("T");
    expect(map.Luis["2026-02-01"]).toBe("V");
  });
});
