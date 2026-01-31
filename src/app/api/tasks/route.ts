import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listTasks, seedTask, startTask, finishTask } from "@/lib/tasks/store";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TaskEntry, Shift } from "@/lib/tasks/types";
import { randomUUID } from "crypto";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

const createSchema = z.object({
  org_id: z.string().default("org-dev"),
  title: z.string(),
  due_date: z.string(),
  shift: z.enum(["morning", "evening"]),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  event_id: z.string().optional().nullable(),
  recipe_id: z.string().optional().nullable(),
  servings: z.number().int().nonnegative().optional().nullable(),
  hall: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const shift = (searchParams.get("shift") as Shift | null) ?? undefined;

  if (isE2E) {
    return NextResponse.json({ data: listTasks({ from, to, shift }), mode: "e2e" });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ data: [], mode: "stub", error: "supabase not configured" });

  const query = admin
    .from("tasks")
    .select("*")
    .eq("org_id", "org-dev")
    .order("due_date", { ascending: true })
    .order("priority", { ascending: false });

  if (from) query.gte("due_date", from);
  if (to) query.lte("due_date", to);
  if (shift) query.eq("shift", shift);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, mode: "prod" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const payload: TaskEntry = {
      id: randomUUID(),
      status: "pending",
      started_at: null,
      finished_at: null,
      ...parsed,
    };

    if (isE2E) {
      seedTask(payload);
      return NextResponse.json({ data: payload, mode: "e2e" });
    }

    const admin = supabaseAdmin();
    if (!admin) return NextResponse.json({ data: payload, mode: "stub", error: "supabase not configured" });

    const { data, error } = await admin.from("tasks").insert(payload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data, mode: "prod" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "invalid" }, { status: 400 });
  }
}
