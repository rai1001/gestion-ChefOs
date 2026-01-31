import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/receptions/store";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listTasks } from "@/lib/tasks/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  if (isE2E) {
    const alerts = [...listAlerts()];
    const today = new Date().toISOString().slice(0, 10);
    const tasks = listTasks();
    tasks
      .filter((t) => t.status !== "done" && t.due_date < today)
      .forEach((t) =>
        alerts.push({
          type: "delay",
          message: `Tarea pendiente: ${t.title}`,
          reception_id: t.id,
        } as any)
      );
    return NextResponse.json({ data: alerts, mode: "e2e" });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ data: [], mode: "stub", error: "supabase not configured" });

  const { data: alerts, error } = await admin.from("alerts").select("id, category, message, created_at").order("created_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: overdueTasks, error: taskErr } = await admin
    .from("tasks")
    .select("id, title, status, due_date")
    .eq("org_id", "org-dev")
    .neq("status", "done")
    .lt("due_date", today)
    .limit(50);
  if (taskErr) return NextResponse.json({ error: taskErr.message }, { status: 500 });

  const taskAlerts =
    overdueTasks?.map((t: any) => ({
      id: t.id,
      category: "tasks",
      message: `Tarea pendiente: ${t.title}`,
      created_at: null,
    })) ?? [];

  return NextResponse.json({ data: [...(alerts ?? []), ...taskAlerts], mode: "prod" });
}
