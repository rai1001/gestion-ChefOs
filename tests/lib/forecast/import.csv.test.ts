import { describe, it, expect, beforeEach } from "vitest";
import { parseForecastXlsx } from "@/lib/forecast/import";
import { upsertEntries, listEntries, resetStore } from "@/lib/forecast/store";

describe("forecast import csv", () => {
  beforeEach(() => {
    resetStore();
  });

  it("parses CSV wide format (fecha,ocupacion,desayunos)", () => {
    const csv = [
      "fecha,ocupacion,desayunos",
      "2026-02-01,150,140",
      "2026-02-02,120,110",
    ].join("\n");
    const buf = Buffer.from(csv, "utf8");
    const rows = parseForecastXlsx(buf, true);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ forecast_date: "2026-02-01", breakfasts: 140, guests: 150 });
  });

  it("upsertEntries replaces same date instead of accumulating", () => {
    upsertEntries([{ org_id: "org", forecast_date: "2026-02-01", guests: 100, breakfasts: 90 }]);
    upsertEntries([{ org_id: "org", forecast_date: "2026-02-01", guests: 120, breakfasts: 110 }]);
    const rows = listEntries();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ guests: 120, breakfasts: 110 });
  });
});
