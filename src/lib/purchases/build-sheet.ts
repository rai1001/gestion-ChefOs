import { computeOrderDeadline, type SupplierConfig } from "./deadline";

export type PurchaseItem = {
  supplier: string;
  product: string;
  quantity: number;
  unit: string;
  // New path: event-based ordering using supplier windows
  event_date?: string;
  supplier_config?: SupplierConfig & { lead_time_days?: number };
  // Back-compat path used by older tests/imports
  lead_time_days?: number;
  delivery_days?: number[]; // ISO weekday numbers 1=Mon ... 7=Sun
};

export type SupplierSheet = {
  supplier: string;
  deadline: string; // ISO date to enviar pedido
  delivery_eta?: string; // fecha prevista de entrega (si aplica)
  lines: Array<Omit<PurchaseItem, "supplier">>;
};

function nextAllowedDay(base: Date, minDays = 0, deliveryDays?: number[]): Date {
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

type DeadlineResult = { order_date: string; delivery_eta?: string };

function computeDeadline(item: PurchaseItem, today: Date): DeadlineResult {
  if (item.event_date && item.supplier_config) {
    const res = computeOrderDeadline(item.event_date, item.supplier_config);
    return { order_date: res.order_date, delivery_eta: res.delivery_eta };
  }

  // fallback legacy path with lead_time_days + delivery_days
  const lead = item.lead_time_days ?? item.supplier_config?.prep_hours ?? 0;
  const deadlineDate = nextAllowedDay(today, lead, item.delivery_days ?? item.supplier_config?.delivery_days);
  return { order_date: deadlineDate.toISOString().slice(0, 10) };
}

function minDate(a?: string, b?: string) {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}

export function buildSheet(items: PurchaseItem[], today: Date = new Date()): SupplierSheet[] {
  const grouped = new Map<string, SupplierSheet>();

  for (const item of items) {
    const { order_date, delivery_eta } = computeDeadline(item, today);
    if (!grouped.has(item.supplier)) {
      grouped.set(item.supplier, { supplier: item.supplier, deadline: order_date, delivery_eta, lines: [] });
    }
    const entry = grouped.get(item.supplier)!;
    entry.deadline = minDate(entry.deadline, order_date) ?? order_date;
    entry.delivery_eta = minDate(entry.delivery_eta, delivery_eta) ?? delivery_eta;
    entry.lines.push({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit,
      event_date: item.event_date,
      supplier_config: item.supplier_config,
      lead_time_days: item.lead_time_days,
      delivery_days: item.delivery_days,
    });
  }

  return Array.from(grouped.values());
}
