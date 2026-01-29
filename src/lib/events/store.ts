type EventEntry = {
  org_id: string;
  event_date: string;
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
    const key = `${row.org_id}-${row.event_date}`;
    store.set(key, { ...store.get(key), ...row });
  }
}

export function attachMenu(orgId: string, event_date: string, menu_name?: string | null) {
  const key = `${orgId}-${event_date}`;
  const existing = store.get(key) ?? { org_id: orgId, event_date, attendees: 0 };
  store.set(key, { ...existing, menu_name: menu_name ?? existing.menu_name ?? null });
}

export function listEventSheets() {
  return Array.from(store.values()).map((row) => ({
    ...row,
    production_items: row.attendees, // placeholder metric
  }));
}
