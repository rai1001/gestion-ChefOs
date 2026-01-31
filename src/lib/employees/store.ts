import { randomUUID } from "crypto";

export type Employee = {
  id: string;
  org_id: string;
  hotel_id: string | null;
  name: string;
  email?: string | null;
  role: string;
};

const employees = new Map<string, Employee>();

export function resetEmployeesStore() {
  employees.clear();
}

export function seedEmployee(e: Employee) {
  employees.set(e.id, e);
}

export function listEmployees(org_id: string, hotel_id?: string | null) {
  return Array.from(employees.values()).filter((e) => e.org_id === org_id && (!hotel_id || e.hotel_id === hotel_id));
}

export function createEmployee(org_id: string, hotel_id: string | null, name: string, role: string, email?: string | null) {
  const e: Employee = { id: randomUUID(), org_id, hotel_id, name, role, email: email ?? null };
  employees.set(e.id, e);
  return e;
}
