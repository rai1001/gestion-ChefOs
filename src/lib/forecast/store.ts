export type ForecastEntry = {
  org_id: string;
  forecast_date: string;
  guests: number;
  breakfasts: number;
  actual_breakfasts?: number;
};

const store = new Map<string, ForecastEntry>();

export function resetStore() {
  store.clear();
}

export function upsertEntries(rows: ForecastEntry[]) {
  for (const row of rows) {
    const key = `${row.org_id}-${row.forecast_date}`;
    store.set(key, { org_id: row.org_id, forecast_date: row.forecast_date, guests: row.guests, breakfasts: row.breakfasts, actual_breakfasts: row.actual_breakfasts });
  }
}

export function updateActual(orgId: string, forecast_date: string, actual: number) {
  const key = `${orgId}-${forecast_date}`;
  const existing = store.get(key) ?? { org_id: orgId, forecast_date, guests: 0, breakfasts: 0 };
  store.set(key, { ...existing, actual_breakfasts: actual });
}

export function listDelta() {
  return Array.from(store.values()).map((row) => ({
    ...row,
    actual_breakfasts: row.actual_breakfasts ?? 0,
    delta: (row.actual_breakfasts ?? 0) - row.breakfasts,
  }));
}

export function listEntries() {
  return Array.from(store.values());
}
