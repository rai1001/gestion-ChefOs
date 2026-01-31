import { NextRequest, NextResponse } from "next/server";
import { addLotWithQuantity, listLots } from "@/lib/tasks/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (isE2E) {
    const lot = addLotWithQuantity({
      org_id: body.org_id || "org-dev",
      product_id: body.product_id,
      quantity: body.quantity,
      expires_at: body.expires_at,
    });
    return NextResponse.json({ status: "ok", lot, mode: "e2e" });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ status: "stub", error: "supabase not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("inventory_lots")
    .insert({
      org_id: body.org_id || "org-dev",
      product_id: body.product_id,
      quantity: body.quantity ?? 1,
      unit: body.unit ?? "ud",
      expires_at: body.expires_at ?? null,
    })
    .select("id, product_id, quantity, unit, expires_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: "ok", lot: data, mode: "prod" });
}

export async function GET() {
  if (isE2E) {
    return NextResponse.json({ data: listLots(), mode: "e2e" });
  }
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ data: [], mode: "stub", error: "supabase not configured" });
  const { data, error } = await admin
    .from("inventory_lots")
    .select("id, product_id, quantity, unit, expires_at")
    .eq("org_id", "org-dev")
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}
