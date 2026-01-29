export type Lot = {
  id: string;
  org_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number; // cents
};

export type Merma = {
  lot_id: string;
  quantity: number;
  reason?: string;
};

/**
 * Recompute total cost after merma and return updated lot plus cost delta.
 */
export function applyMerma(lot: Lot, merma: Merma) {
  if (merma.quantity < 0) throw new Error("merma cannot be negative");
  if (merma.quantity > lot.quantity) throw new Error("merma exceeds lot quantity");
  const newQty = lot.quantity - merma.quantity;
  const lostCost = Math.round(merma.quantity * lot.unit_cost);
  const updated: Lot = { ...lot, quantity: newQty };
  return { updated, lostCost };
}

