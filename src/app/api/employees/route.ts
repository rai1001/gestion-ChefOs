import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listEmployees, createEmployee } from "@/lib/employees/store";

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const org_id = url.searchParams.get("org_id") ?? "org-dev";
  const hotel_id = url.searchParams.get("hotel_id");
  if (isE2E()) {
    return NextResponse.json({ data: listEmployees(org_id, hotel_id), mode: "e2e" });
  }
  const admin = supabaseAdmin();
  if (!admin) {
    return NextResponse.json({ data: listEmployees(org_id, hotel_id), mode: "stub" });
  }
  const q = admin.from("employees").select("*").eq("org_id", org_id);
  if (hotel_id) q.eq("hotel_id", hotel_id);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org_id = body?.org_id ?? "org-dev";
  const name = body?.name as string;
  const hotel_id = body?.hotel_id ?? null;
  const role = body?.role ?? "staff";
  const email = body?.email ?? null;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  if (isE2E()) {
    const emp = createEmployee(org_id, hotel_id, name, role, email);
    return NextResponse.json({ data: emp, mode: "e2e" }, { status: 201 });
  }
  const admin = supabaseAdmin();
  if (!admin) {
    const emp = createEmployee(org_id, hotel_id, name, role, email);
    return NextResponse.json({ data: emp, mode: "stub" }, { status: 201 });
  }
  const { data, error } = await admin.from("employees").insert({ org_id, hotel_id, name, role, email }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" }, { status: 201 });
}
