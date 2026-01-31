import { describe, it, expect, vi } from "vitest";

const upsert = vi.fn(async () => ({ data: [], error: null }));
const from = vi.fn(() => ({ upsert }));

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: () => ({ from }),
}));

import { upsertEventsFromXlsx, upsertEvents } from "@/lib/events/import";
import * as XLSX from "xlsx";

describe("events import", () => {
  beforeEach(() => {
    from.mockClear();
    upsert.mockClear();
  });

  it("upserts events with onConflict for date+hall", async () => {
    const rows = [{ event_date: "2026-03-01", hall: "ROSALIA", attendees: 80, menu_id: null }];
    await upsertEvents(rows as any, "org-x");
    expect(upsert).toHaveBeenCalled();
    const [payload, opts] = upsert.mock.calls[0];
    expect(payload[0]).toMatchObject({ org_id: "org-x", attendees: 80, hall: "ROSALIA" });
    expect(opts).toMatchObject({ onConflict: "org_id,event_date,hall" });
  });

  it("parses xlsx and registers import + events", async () => {
    const data = [
      ["", "ROSALIA", "PONDAL"],
      ["2026-03-02", "Brunch | Banquete | 120", "Reunión | Corporate | 40"],
      ["2026-03-03", "Buffet | Buffet | 60", ""],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Q1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    await upsertEventsFromXlsx(buf, "org-y");

    expect(from).toHaveBeenCalledWith("events");
    const last = upsert.mock.calls[upsert.mock.calls.length - 1];
    const [payload, opts] = last;
    expect(payload.length).toBeGreaterThanOrEqual(0);
    expect(opts).toMatchObject({ onConflict: "org_id,event_date,hall" });
  });
});
