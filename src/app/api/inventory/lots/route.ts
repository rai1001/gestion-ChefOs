import { NextRequest, NextResponse } from "next/server";
import { addLotWithQuantity, listLots } from "@/lib/tasks/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  if (!isE2E) return NextResponse.json({ status: "stub" });
  const body = await req.json();
  const lot = addLotWithQuantity({
    org_id: body.org_id || "org-dev",
    product_id: body.product_id,
    quantity: body.quantity,
    expires_at: body.expires_at,
  });
  return NextResponse.json({ status: "ok", lot, mode: "e2e" });
}

export async function GET() {
  if (!isE2E) return NextResponse.json({ data: [] });
  return NextResponse.json({ data: listLots(), mode: "e2e" });
}
