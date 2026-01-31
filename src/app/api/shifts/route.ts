import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listShifts, createShift } from "@/lib/shifts/store";

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const org_id = url.searchParams.get("org_id") ?? "org-dev";
  const start = url.searchParams.get("start") ?? undefined;
  const end = url.searchParams.get("end") ?? undefined;
  if (isE2E()) return NextResponse.json({ data: listShifts(org_id, start, end), mode: "e2e" });

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ data: listShifts(org_id, start, end), mode: "stub" });

  const q = admin.from("shifts").select("*").eq("org_id", org_id);
  if (start) q.gte("shift_date", start);
  if (end) q.lte("shift_date", end);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org_id = body?.org_id ?? "org-dev";
  const shift_date = body?.shift_date;
  const shift_code = body?.shift_code ?? "morning";
  const status = body?.status ?? "scheduled";
  const hotel_id = body?.hotel_id ?? null;
  const employee_name = body?.employee_name ?? null;
  if (!shift_date) return NextResponse.json({ error: "shift_date required" }, { status: 400 });

  if (isE2E()) {
    const s = createShift({ org_id, shift_date, shift_code, status, hotel_id, employee_name });
    return NextResponse.json({ data: s, mode: "e2e" }, { status: 201 });
  }
  const admin = supabaseAdmin();
  if (!admin) {
    const s = createShift({ org_id, shift_date, shift_code, status, hotel_id, employee_name });
    return NextResponse.json({ data: s, mode: "stub" }, { status: 201 });
  }
  const { data, error } = await admin
    .from("shifts")
    .insert({ org_id, shift_date, shift_code, status, hotel_id, employee_name })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" }, { status: 201 });
}
