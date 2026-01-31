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
  type: "delay" | "shortage";
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
  for (const rec of receptions.values()) {
    if (rec.delayed) alerts.push({ type: "delay", message: "Entrega retrasada", reception_id: rec.id });
    if (rec.received_qty < rec.expected_qty) alerts.push({ type: "shortage", message: "Falta cantidad por recibir", reception_id: rec.id });
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
  return rec;
}
