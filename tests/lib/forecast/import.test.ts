import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";

const upsert = vi.fn(async () => ({ data: [], error: null }));
const from = vi.fn(() => ({ upsert }));

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: () => ({ from }),
}));

import { parseForecastXlsx, upsertForecastsFromXlsx, upsertForecasts } from "@/lib/forecast/import";

describe("forecast import", () => {
  it("adds org_id and uses onConflict for idempotency", async () => {
    const rows = [{ forecast_date: "2026-01-30", guests: 120, breakfasts: 100 }];
    await upsertForecasts(rows as any, "org-1");

    expect(upsert).toHaveBeenCalledTimes(1);
    const [payload, options] = upsert.mock.calls[0];
    expect(payload[0]).toMatchObject({ org_id: "org-1", breakfasts: 100 });
    expect(options).toMatchObject({ onConflict: "org_id,forecast_date" });
  });

  it("parses xlsx and upserts import + forecasts", async () => {
    const sheet = XLSX.utils.json_to_sheet([
      { fecha: "2026-02-01", ocupacion: 150, desayunos: 140 },
      { fecha: "2026-02-02", ocupacion: 120, desayunos: 110 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    await upsertForecastsFromXlsx(buf, "org-2");

    // first call for forecast_imports
    expect(from).toHaveBeenCalledWith("forecast_imports");
    // second call for forecasts
    expect(from).toHaveBeenCalledWith("forecasts");
    const lastCall = upsert.mock.calls[upsert.mock.calls.length - 1];
    const [payload, opts] = lastCall;
    expect(payload).toHaveLength(2);
    expect(payload[0]).toMatchObject({ forecast_date: "2026-02-01", breakfasts: 140, org_id: "org-2" });
    expect(opts).toMatchObject({ onConflict: "org_id,forecast_date" });
  });
});
