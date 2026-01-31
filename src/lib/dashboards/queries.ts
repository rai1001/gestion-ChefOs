import { supabaseClient } from "@/lib/supabase/client";
import { listLots, listTasks } from "@/lib/tasks/store";

export type AlertSummary = { org_id: string; alert_count: number };
export type ExpirySummary = { lot_id: string; product_id?: string; expires_at?: string };
export type ForecastDelta = { forecast_date: string; delta: number };
export type UpcomingEvent = { event_date: string; hall: string; name: string; event_type?: string | null; attendees: number };

export async function getAlertSummary(org_id: string): Promise<AlertSummary[]> {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) {
    const lots = listLots();
    const today = new Date();
    const soon = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);
    const alertCount = lots.filter((l) => l.expires_at && l.expires_at <= soon).length;
    const tasks = listTasks();
    const overdue = tasks.filter((t) => t.status !== "done" && t.due_date < today.toISOString().slice(0, 10)).length;
    return [{ org_id, alert_count: alertCount + overdue }];
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase.from("kpi_alert_counts").select("*").eq("org_id", org_id);
  if (error) throw error;
  let count = (data as AlertSummary[]) ?? [];

  // add overdue tasks count
  const today = new Date().toISOString().slice(0, 10);
  const { data: tasks, error: taskErr } = await supabase
    .from("tasks")
    .select("id")
    .eq("org_id", org_id)
    .neq("status", "done")
    .lt("due_date", today);
  if (!taskErr && tasks) {
    const extra = tasks.length;
    if (count.length === 0) count = [{ org_id, alert_count: extra }];
    else count = count.map((c) => ({ ...c, alert_count: c.alert_count + extra }));
  }

  return count;
}

export async function getExpirySoon(org_id: string, daysAhead = 2): Promise<ExpirySummary[]> {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) {
    const lots = listLots();
    const soon = new Date(Date.now() + daysAhead * 86400000);
    return lots.filter((l) => l.expires_at && new Date(l.expires_at) <= soon).map((l) => ({ lot_id: l.id, product_id: l.product_id, expires_at: l.expires_at }));
  }
  const supabase = supabaseClient();
  const limitDate = new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("inventory_lots")
    .select("id, product_id, expires_at")
    .eq("org_id", org_id)
    .lte("expires_at", limitDate)
    .order("expires_at", { ascending: true })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((r) => ({ lot_id: (r as any).id, product_id: (r as any).product_id, expires_at: (r as any).expires_at }));
}

export async function getForecastDelta(org_id: string): Promise<ForecastDelta[]> {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) {
    return [{ forecast_date: "2026-02-01", delta: -10 }];
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase.from("forecast_delta").select("forecast_date, delta").eq("org_id", org_id);
  if (error) throw error;
  return (data as ForecastDelta[]) ?? [];
}

export async function getUpcomingEvents(org_id: string, daysAhead = 30): Promise<UpcomingEvent[]> {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) {
    return [
      { event_date: "2026-02-10", hall: "ROSALIA", name: "Cena Gala", event_type: "Banquete", attendees: 120 },
      { event_date: "2026-02-11", hall: "PONDAL", name: "Conferencia", event_type: "Corporate", attendees: 60 },
    ];
  }
  const supabase = supabaseClient();
  const limitDate = new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("kpi_upcoming_events")
    .select("event_date, hall, name, event_type, attendees")
    .eq("org_id", org_id)
    .lte("event_date", limitDate);
  if (error) throw error;
  return (data as UpcomingEvent[]) ?? [];
}
