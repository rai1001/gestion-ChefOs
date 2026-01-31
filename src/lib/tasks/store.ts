import { randomUUID } from "crypto";

export type TaskEntry = {
  id: string;
  org_id: string;
  title: string;
  status: "pending" | "in_progress" | "done";
  started_at?: string;
  finished_at?: string;
};

export type InventoryLot = {
  id: string;
  org_id: string;
  product_id?: string;
  quantity?: number;
  unit?: string;
  expires_at: string;
  label_id: string;
};

const tasks = new Map<string, TaskEntry>();
const lots = new Map<string, InventoryLot>();

export function resetTasksStore() {
  tasks.clear();
  lots.clear();
}

export function seedTask(task: TaskEntry) {
  tasks.set(task.id, task);
}

export function listTasks() {
  return Array.from(tasks.values());
}

export function startTask(id: string) {
  const t = tasks.get(id);
  if (!t) throw new Error("task not found");
  if (t.status !== "pending") throw new Error("cannot start");
  const now = new Date().toISOString();
  const updated = { ...t, status: "in_progress", started_at: now } as TaskEntry;
  tasks.set(id, updated);
  return updated;
}

export function finishTask(id: string) {
  const t = tasks.get(id);
  if (!t) throw new Error("task not found");
  if (t.status !== "in_progress") throw new Error("cannot finish before start");
  const now = new Date().toISOString();
  const updated = { ...t, status: "done", finished_at: now } as TaskEntry;
  tasks.set(id, updated);
  return updated;
}

export function createLabel(opts: { org_id: string; task_id: string; expires_at: string; product_id?: string }) {
  if (!opts.expires_at) throw new Error("expires_at required");
  const task = tasks.get(opts.task_id);
  if (!task) throw new Error("task not found");
  if (task.status !== "done") throw new Error("task must be finished to label");

  const label_id = randomUUID();
  const lot_id = randomUUID();
  lots.set(lot_id, {
    id: lot_id,
    org_id: opts.org_id,
    product_id: opts.product_id,
    quantity: 1,
    unit: "ud",
    expires_at: opts.expires_at,
    label_id,
  });
  return { label_id, lot_id, barcode: `LBL-${label_id.substring(0, 8)}` };
}

export function listLots() {
  return Array.from(lots.values());
}

export function addLot(org_id: string, lot_id: string, product_id?: string, expires_at?: string) {
  lots.set(lot_id, {
    id: lot_id,
    org_id,
    product_id,
    quantity: 1,
    unit: "ud",
    expires_at: expires_at ?? new Date().toISOString().slice(0, 10),
    label_id: `LBL-${lot_id}`,
  });
}

export function addLotWithQuantity(input: { org_id: string; product_id?: string; quantity?: number; expires_at?: string }) {
  const lot_id = randomUUID();
  lots.set(lot_id, {
    id: lot_id,
    org_id: input.org_id,
    product_id: input.product_id,
    quantity: input.quantity ?? 1,
    unit: "ud",
    expires_at: input.expires_at ?? new Date().toISOString().slice(0, 10),
    label_id: `LBL-${lot_id}`,
  });
  return lots.get(lot_id)!;
}
