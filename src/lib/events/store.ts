type EventEntry = {
  org_id: string;
  event_date: string;
  hall: string;
  name: string;
  event_type?: string | null;
  attendees: number;
  menu_name?: string | null;
  menu_id?: string | null;
};

// ensure singleton across route handlers in dev/e2e
const globalAny = globalThis as any;
const store: Map<string, EventEntry> = globalAny.__eventsStore ?? new Map<string, EventEntry>();
globalAny.__eventsStore = store;

export function resetEventsStore() {
  store.clear();
}

export function upsertEventEntries(rows: EventEntry[]) {
  for (const row of rows) {
    const key = `${row.org_id}-${row.event_date}-${row.hall}`;
    store.set(key, { org_id: row.org_id, event_date: row.event_date, hall: row.hall, name: row.name, event_type: row.event_type, attendees: row.attendees, menu_name: row.menu_name ?? null, menu_id: row.menu_id ?? null });
  }
}

export function attachMenu(orgId: string, event_date: string, hall?: string | null, menu_name?: string | null) {
  const hallNorm = hall ? hall.trim().toUpperCase() : null;
  for (const key of Array.from(store.keys()).filter((k) => k.startsWith(`${orgId}-${event_date}-`))) {
    const existing = store.get(key);
    if (!existing) continue;
    if (hallNorm && existing.hall.trim().toUpperCase() !== hallNorm) continue;
    store.set(key, { ...existing, menu_name: menu_name ?? existing.menu_name ?? null });
  }
}

export function listEvents() {
  return Array.from(store.values());
}

export function listUpcomingEvents(daysAhead: number) {
  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + daysAhead);
  return Array.from(store.values()).filter((ev) => {
    const d = new Date(ev.event_date);
    return d >= now && d <= limit;
  });
}

export function listEventSheets(event_date?: string, hall?: string | null, aggregateByEvent = false) {
  const hallNorm = hall ? hall.trim().toUpperCase() : null;
  const filtered = Array.from(store.values())
    .filter((row) => (event_date ? row.event_date === event_date : true))
    .filter((row) => (hallNorm ? row.hall.trim().toUpperCase() === hallNorm : true));

  if (aggregateByEvent) {
    const byDate = new Map<string, { event_date: string; attendees: number; menu_name?: string | null }>();
    for (const row of filtered) {
      const agg = byDate.get(row.event_date) ?? { event_date: row.event_date, attendees: 0, menu_name: row.menu_name ?? null };
      agg.attendees += row.attendees;
      agg.menu_name = agg.menu_name || row.menu_name || null;
      byDate.set(row.event_date, agg);
    }
    return Array.from(byDate.values()).map((row) => ({
      ...row,
      hall: "TODOS",
      production_items: row.attendees,
      purchases_items: row.attendees,
    }));
  }

  return filtered.map((row) => ({
    ...row,
    production_items: row.attendees,
    purchases_items: row.attendees, // simple stub: 1 item per pax
  }));
}
