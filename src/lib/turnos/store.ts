export type Shift = {
  id: string;
  org_id: string;
  shift_date: string;
  name: string;
  employee_id?: string;
  vacation?: boolean;
};

const shifts = new Map<string, Shift>();

export function resetShiftsStore() {
  shifts.clear();
}

export function createShift(data: Shift) {
  shifts.set(data.id, data);
  return data;
}

export function listShifts() {
  return Array.from(shifts.values());
}

