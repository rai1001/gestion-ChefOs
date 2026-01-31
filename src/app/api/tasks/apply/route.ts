import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createTasksFromEventSheets } from "@/lib/tasks/fromSheets";
import { randomUUID } from "crypto";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const org_id = body.org_id || "org-dev";
  const event_date = body.event_date as string | undefined;
  const hall = (body.hall as string | null) ?? null;

  if (isE2E) {
    const created = createTasksFromEventSheets(org_id, event_date, hall);
    return NextResponse.json({ data: created, mode: "e2e" });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "supabase not configured" }, { status: 500 });

  // Pull events from Supabase and create tasks
  const query = admin.from("events").select("id, event_date, hall, name, attendees").eq("org_id", org_id);
  if (event_date) query.eq("event_date", event_date);
  if (hall) query.ilike("hall", hall);
  const { data: events, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payload =
    events?.map((ev: any) => ({
      id: randomUUID(),
      org_id,
      title: ev.name,
      status: "pending",
      due_date: ev.event_date,
      shift: "morning",
      priority: "medium",
      event_id: ev.id,
      servings: ev.attendees ?? 0,
      hall: ev.hall,
    })) ?? [];

  if (payload.length === 0) return NextResponse.json({ data: [], mode: "prod" });

  const { data, error: upErr } = await admin.from("tasks").upsert(payload, { onConflict: "org_id,due_date,hall,title" }).select("*");
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}
