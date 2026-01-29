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

const store = new Map<string, EventEntry>();

export function resetEventsStore() {
  store.clear();
}

export function upsertEventEntries(rows: EventEntry[]) {
  for (const row of rows) {
    const key = `${row.org_id}-${row.event_date}-${row.hall}`;
    store.set(key, { org_id: row.org_id, event_date: row.event_date, hall: row.hall, name: row.name, event_type: row.event_type, attendees: row.attendees, menu_name: row.menu_name ?? null, menu_id: row.menu_id ?? null });
  }
}

export function attachMenu(orgId: string, event_date: string, menu_name?: string | null) {
  for (const key of Array.from(store.keys()).filter((k) => k.startsWith(`${orgId}-${event_date}-`))) {
    const existing = store.get(key);
    if (existing) {
      store.set(key, { ...existing, menu_name: menu_name ?? existing.menu_name ?? null });
    }
  }
}

export function listEventSheets() {
  return Array.from(store.values()).map((row) => ({
    ...row,
    production_items: row.attendees, // placeholder metric
  }));
}
