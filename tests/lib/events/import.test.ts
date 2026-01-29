import { describe, it, expect, vi } from "vitest";

const upsert = vi.fn(async () => ({ data: [], error: null }));
const from = vi.fn(() => ({ upsert }));

vi.mock("@/lib/supabase/client", () => ({
  supabaseClient: () => ({ from }),
}));

import { upsertEventsFromXlsx, upsertEvents } from "@/lib/events/import";
import * as XLSX from "xlsx";

describe("events import", () => {
  it("upserts events with onConflict for date", async () => {
    const rows = [{ event_date: "2026-03-01", attendees: 80, menu_id: null }];
    await upsertEvents(rows as any, "org-x");
    expect(upsert).toHaveBeenCalled();
    const [payload, opts] = upsert.mock.calls[0];
    expect(payload[0]).toMatchObject({ org_id: "org-x", attendees: 80 });
    expect(opts).toMatchObject({ onConflict: "org_id,event_date" });
  });

  it("parses xlsx and registers import + events", async () => {
    const sheet = XLSX.utils.json_to_sheet([
      { fecha: "2026-03-02", asistentes: 120, menu: "Brunch" },
      { fecha: "2026-03-03", asistentes: 60, menu: "Buffet" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

    await upsertEventsFromXlsx(buf, "org-y");

    expect(from).toHaveBeenCalledWith("event_imports");
    expect(from).toHaveBeenCalledWith("events");
    const last = upsert.mock.calls[upsert.mock.calls.length - 1];
    const [payload, opts] = last;
    expect(payload).toHaveLength(2);
    expect(payload[0]).toMatchObject({ event_date: "2026-03-02", attendees: 120, org_id: "org-y" });
    expect(opts).toMatchObject({ onConflict: "org_id,event_date" });
  });
});
