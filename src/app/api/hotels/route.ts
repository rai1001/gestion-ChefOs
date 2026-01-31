import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createHotel, listHotels } from "@/lib/hotels/store";

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const org_id = (new URL(req.url).searchParams.get("org_id") as string) || "org-dev";
  if (isE2E()) {
    const data = listHotels(org_id);
    const payload = data.length > 0 ? data : [{ id: "hotel-demo", org_id, name: "Hotel Demo" }];
    return NextResponse.json({ data: payload, mode: "e2e" });
  }
  const admin = supabaseAdmin();
  if (!admin) {
    // fallback stub when supabase not configured
    const data = listHotels(org_id);
    const payload = data.length > 0 ? data : [{ id: "hotel-demo", org_id, name: "Hotel Demo" }];
    return NextResponse.json({ data: payload, mode: "stub" });
  }
  const { data, error } = await admin.from("hotels").select("*").eq("org_id", org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org_id = body?.org_id || "org-dev";
  const name = body?.name as string;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  if (isE2E()) {
    const hotel = createHotel(org_id, name, body?.created_by);
    return NextResponse.json({ data: hotel, mode: "e2e" }, { status: 201 });
  }

  const admin = supabaseAdmin();
  if (!admin) {
    const hotel = createHotel(org_id, name, body?.created_by);
    return NextResponse.json({ data: hotel, mode: "stub" }, { status: 201 });
  }
  const { data, error } = await admin.from("hotels").insert({ org_id, name, created_by: body?.created_by }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" }, { status: 201 });
}
