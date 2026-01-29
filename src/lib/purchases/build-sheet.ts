export type PurchaseItem = {
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  lead_time_days: number;
  delivery_days?: number[]; // ISO weekday numbers 1=Mon ... 7=Sun
};

export type SupplierSheet = {
  supplier: string;
  deadline: string; // ISO date
  lines: Array<Omit<PurchaseItem, "supplier">>;
};

function nextAllowedDay(base: Date, minDays: number, deliveryDays?: number[]): Date {
  const start = new Date(base);
  start.setDate(start.getDate() + minDays);
  if (!deliveryDays || deliveryDays.length === 0) return start;

  const allowed = new Set(deliveryDays);
  // iterate up to 14 days to find next allowed slot
  for (let i = 0; i < 14; i++) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + i);
    const isoDow = ((candidate.getDay() + 6) % 7) + 1; // convert JS 0=Sun -> ISO 1=Mon
    if (allowed.has(isoDow)) return candidate;
  }
  return start;
}

export function buildSheet(items: PurchaseItem[], today: Date = new Date()): SupplierSheet[] {
  const grouped = new Map<string, SupplierSheet>();

  for (const item of items) {
    const deadlineDate = nextAllowedDay(today, item.lead_time_days, item.delivery_days);
    const deadline = deadlineDate.toISOString().slice(0, 10);
    if (!grouped.has(item.supplier)) {
      grouped.set(item.supplier, { supplier: item.supplier, deadline, lines: [] });
    }
    const entry = grouped.get(item.supplier)!;
    entry.deadline = deadline; // keep latest computed deadline
    entry.lines.push({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      lead_time_days: item.lead_time_days,
      delivery_days: item.delivery_days,
    });
  }

  return Array.from(grouped.values());
}

