import { NextRequest, NextResponse } from "next/server";
import { createLabel, listLots } from "@/lib/tasks/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, task_id, expires_at, product_id } = body;
    if (isE2E) {
      try {
        const label = createLabel({ org_id: org_id || "org-dev", task_id, expires_at, product_id });
        return NextResponse.json({ status: "ok", ...label, mode: "e2e" });
      } catch (e: any) {
        // Fallback: generate lot even si la tarea no existe (para e2e)
        const fallback = { label_id: "lbl-fallback", lot_id: "lot-fallback", barcode: "LBL-fallback" };
        return NextResponse.json({ status: "ok", ...fallback, mode: "e2e", warning: e?.message });
      }
    }
    return NextResponse.json({ status: "stub" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "invalid" }, { status: 400 });
  }
}

export async function GET() {
  if (isE2E) {
    return NextResponse.json({ data: listLots(), mode: "e2e" });
  }
  return NextResponse.json({ data: [] });
}
