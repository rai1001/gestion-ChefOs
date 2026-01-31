import { randomUUID } from "crypto";

export type Hotel = { id: string; org_id: string; name: string; created_by?: string | null };

const hotels = new Map<string, Hotel>();

export function resetHotelsStore() {
  hotels.clear();
}

export function seedHotel(h: Hotel) {
  hotels.set(h.id, h);
}

export function listHotels(org_id: string) {
  return Array.from(hotels.values()).filter((h) => h.org_id === org_id);
}

export function createHotel(org_id: string, name: string, created_by?: string | null) {
  const newHotel: Hotel = { id: randomUUID(), org_id, name, created_by: created_by ?? null };
  hotels.set(newHotel.id, newHotel);
  return newHotel;
}
