import { describe, it, expect } from "vitest";
import { buildMonthMatrix, groupByDate, labelShift } from "@/lib/calendar/utils";

describe("calendar utils", () => {
  it("builds 6-week matrix starting Monday", () => {
    const matrix = buildMonthMatrix(new Date("2026-02-15T00:00:00Z"));
    expect(matrix).toHaveLength(42);
    expect(matrix[0].date.endsWith("-01")); // Jan 26 2026 is Monday
  });

  it("groups by date key", () => {
    const res = groupByDate([{ date: "2026-02-01" }, { date: "2026-02-01" }, { date: "2026-02-02" }], "date");
    expect(res["2026-02-01"].length).toBe(2);
    expect(res["2026-02-02"].length).toBe(1);
  });

  it("labels shifts", () => {
    const l = labelShift("scheduled", "morning");
    expect(l.text).toBe("Mañana");
  });

  it("labels vacations", () => {
    const l = labelShift("scheduled", "morning", "Pepe Vacaciones");
    expect(l.text).toBe("Vacaciones");
  });
});
