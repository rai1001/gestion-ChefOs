import { NextRequest, NextResponse } from "next/server";
import { finishTask } from "@/lib/tasks/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  if (isE2E) {
    try {
      const task = finishTask(id);
      return NextResponse.json({ data: task, mode: "e2e" });
    } catch (err: any) {
      return NextResponse.json({ error: err?.message ?? "invalid" }, { status: 400 });
    }
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "supabase not configured" }, { status: 500 });

  const { data: existing, error: fetchErr } = await admin.from("tasks").select("status, started_at").eq("id", id).single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 });
  if (existing.status !== "in_progress") return NextResponse.json({ error: "cannot finish before start" }, { status: 409 });

  const now = new Date().toISOString();
  const { data, error } = await admin.from("tasks").update({ status: "done", finished_at: now }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}
