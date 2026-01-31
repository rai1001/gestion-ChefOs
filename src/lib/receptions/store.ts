export type Reception = {
  id: string;
  org_id: string;
  expected_qty: number;
  expected_date: string; // ISO date
  received_qty: number;
  status: "open" | "partial" | "completed";
  delayed: boolean;
};

export type Alert = {
  type: "delay" | "shortage" | "expiry";
  message: string;
  reception_id: string;
};

const globalStore = (globalThis as any).__receptionsStore ?? { receptions: new Map<string, Reception>() };
if (!(globalThis as any).__receptionsStore) {
  (globalThis as any).__receptionsStore = globalStore;
}
const receptions: Map<string, Reception> = globalStore.receptions;

export function resetReceptionsStore() {
  receptions.clear();
}

export function createReception(input: { id: string; org_id: string; expected_qty: number; expected_date: string }) {
  const rec: Reception = {
    id: input.id,
    org_id: input.org_id,
    expected_qty: input.expected_qty,
    expected_date: input.expected_date,
    received_qty: 0,
    status: "open",
    delayed: false,
  };
  receptions.set(rec.id, rec);
  return rec;
}

export function listReceptions() {
  return Array.from(receptions.values());
}

export function listAlerts() {
  const alerts: Alert[] = [];
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const rec of receptions.values()) {
    const isLate = rec.delayed || rec.expected_date < todayIso;
    if (isLate) alerts.push({ type: "delay", message: "Entrega retrasada", reception_id: rec.id });
    if (rec.received_qty < rec.expected_qty) alerts.push({ type: "shortage", message: "Falta cantidad por recibir", reception_id: rec.id });
  }
  // inventory expiry alerts (E2E store)
  try {
    const { listLots } = require("../tasks/store");
    const lots = listLots() as Array<{ id: string; expires_at?: string; product_id?: string }>;
    const soonDate = new Date(Date.now() + 2 * 86400000); // 48h
    for (const lot of lots) {
      if (!lot.expires_at) continue;
      const exp = new Date(lot.expires_at);
      if (exp <= soonDate) {
        alerts.push({
          type: "expiry",
          message: `Caduca pronto: ${lot.product_id ?? "lote"} (${lot.expires_at})`,
          reception_id: lot.id,
        });
      }
    }
  } catch {
    // ignore if store not available
  }
  return alerts;
}

export function receivePartial(id: string, qty: number, received_at: string) {
  const rec = receptions.get(id);
  if (!rec) throw new Error("reception not found");
  rec.received_qty += qty;
  rec.status = rec.received_qty >= rec.expected_qty ? "completed" : "partial";

  const isLate = received_at > rec.expected_date;
  rec.delayed = rec.delayed || isLate;
  return rec;
}

export function finalizeReception(id: string) {
  const rec = receptions.get(id);
  if (!rec) throw new Error("reception not found");
  rec.status = rec.received_qty >= rec.expected_qty ? "completed" : "partial";
  // mark delayed if a finalization happens after expected date without full qty
  const todayIso = new Date().toISOString().slice(0, 10);
  if (todayIso > rec.expected_date && rec.received_qty < rec.expected_qty) rec.delayed = true;
  return rec;
}
