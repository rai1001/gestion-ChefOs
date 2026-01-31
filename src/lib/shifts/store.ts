import { randomUUID } from "crypto";

export type Shift = { id: string; org_id: string; hotel_id?: string | null; shift_date: string; shift_code: "morning" | "evening"; status: "scheduled" | "done" | "cancelled"; employee_name?: string };

const shifts = new Map<string, Shift>();

export function resetShiftsStore() {
  shifts.clear();
}

export function seedShift(s: Shift) {
  shifts.set(s.id, s);
}

export function listShifts(org_id: string, start?: string, end?: string) {
  return Array.from(shifts.values()).filter((s) => {
    if (s.org_id !== org_id) return false;
    if (start && s.shift_date < start) return false;
    if (end && s.shift_date > end) return false;
    return true;
  });
}

export function createShift(input: Omit<Shift, "id">) {
  const s: Shift = { id: randomUUID(), ...input };
  shifts.set(s.id, s);
  return s;
}
