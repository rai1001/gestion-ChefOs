import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/receptions/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  if (isE2E) {
    return NextResponse.json({ data: listAlerts(), mode: "e2e" });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ data: [], mode: "stub", error: "supabase not configured" });

  const { data, error } = await admin.from("alerts").select("id, category, message, created_at").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}
