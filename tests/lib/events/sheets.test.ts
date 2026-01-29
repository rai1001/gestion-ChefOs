import { describe, it, expect, beforeEach } from "vitest";
import { resetEventsStore, upsertEventEntries, attachMenu, listEventSheets } from "@/lib/events/store";

describe("events sheets", () => {
  beforeEach(() => resetEventsStore());

  it("computes production and purchases per event and attaches menu", () => {
    upsertEventEntries([
      { org_id: "org", event_date: "2026-02-01", hall: "A", name: "Boda", event_type: "Banquete", attendees: 100 },
      { org_id: "org", event_date: "2026-02-01", hall: "B", name: "Conferencia", event_type: "Corporate", attendees: 50 },
    ]);
    attachMenu("org", "2026-02-01", "Menu Gala");
    const rows = listEventSheets().filter((r) => r.event_date === "2026-02-01");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveProperty("production_items", rows[0].attendees);
    expect(rows[0]).toHaveProperty("purchases_items", rows[0].attendees);
    expect(rows.every((r) => r.menu_name === "Menu Gala")).toBe(true);
  });
});
