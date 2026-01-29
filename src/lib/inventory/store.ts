import { Lot } from "./costing";

let lots: Lot[] = [];

export function resetInventoryStore() {
  lots = [];
}

export function seedLot(lot: Lot) {
  lots.push(lot);
}

export function listLots() {
  return lots.slice();
}

export function updateLot(updated: Lot) {
  lots = lots.map((l) => (l.id === updated.id ? updated : l));
}

