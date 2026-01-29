import type { SupplierSheet } from "./build-sheet";

let lastSheet: SupplierSheet[] = [];

export function saveSheet(sheet: SupplierSheet[]) {
  lastSheet = sheet;
}

export function getSheet() {
  return lastSheet;
}

export function resetPurchasesStore() {
  lastSheet = [];
}

