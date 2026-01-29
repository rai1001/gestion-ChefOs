import { NextRequest, NextResponse } from "next/server";
import { applyMerma } from "@/lib/inventory/costing";
import { listLots, updateLot } from "@/lib/inventory/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  if (!isE2E) return NextResponse.json({ status: "stub" });
  const body = await req.json();
  const lot = listLots().find((l) => l.id === body.lot_id);
  if (!lot) return NextResponse.json({ error: "lot not found" }, { status: 404 });
  try {
    const { updated, lostCost } = applyMerma(lot, { lot_id: lot.id, quantity: body.quantity });
    updateLot(updated);
    return NextResponse.json({ status: "ok", lot: updated, lostCost, mode: "e2e" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 400 });
  }
}

