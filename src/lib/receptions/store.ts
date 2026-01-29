export type Reception = {
  id: string;
  org_id: string;
  expected_qty: number;
  expected_date: string; // ISO date
  received_qty: number;
  status: "open" | "partial" | "completed";
};

export type Alert = {
  type: "delay" | "shortage";
  message: string;
  reception_id: string;
};

const receptions = new Map<string, Reception>();
const alerts: Alert[] = [];

export function resetReceptionsStore() {
  receptions.clear();
  alerts.length = 0;
}

export function createReception(input: { id: string; org_id: string; expected_qty: number; expected_date: string }) {
  const rec: Reception = {
    id: input.id,
    org_id: input.org_id,
    expected_qty: input.expected_qty,
    expected_date: input.expected_date,
    received_qty: 0,
    status: "open",
  };
  receptions.set(rec.id, rec);
  return rec;
}

export function listReceptions() {
  return Array.from(receptions.values());
}

export function listAlerts() {
  return alerts.slice();
}

export function receivePartial(id: string, qty: number, received_at: string) {
  const rec = receptions.get(id);
  if (!rec) throw new Error("reception not found");
  rec.received_qty += qty;
  rec.status = rec.received_qty >= rec.expected_qty ? "completed" : "partial";

  const isLate = received_at > rec.expected_date;
  if (isLate) {
    alerts.push({ type: "delay", message: "Entrega retrasada", reception_id: rec.id });
  }
  return rec;
}

export function finalizeReception(id: string) {
  const rec = receptions.get(id);
  if (!rec) throw new Error("reception not found");
  if (rec.received_qty < rec.expected_qty) {
    alerts.push({ type: "shortage", message: "Falta cantidad por recibir", reception_id: rec.id });
  }
  rec.status = rec.received_qty >= rec.expected_qty ? "completed" : "partial";
  return rec;
}

