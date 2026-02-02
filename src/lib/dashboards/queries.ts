import { supabaseClient } from "@/lib/supabase/client";
import { listLots, listTasks } from "@/lib/tasks/store";
import { listUpcomingEvents as listEventsStore } from "@/lib/events/store";
import { listEntries as listForecastEntries, listDelta as listForecastDelta } from "@/lib/forecast/store";

export type AlertSummary = { org_id: string; alert_count: number };
export type ExpirySummary = { lot_id: string; product_id?: string; expires_at?: string };
export type ForecastDelta = { forecast_date: string; delta: number };
export type UpcomingEvent = { event_date: string; hall: string; name: string; event_type?: string | null; attendees: number };
export type UpcomingTask = { id: string; title: string; due_date: string; shift: "morning" | "evening"; status: string; hall?: string | null };
export type AlertItem = { title: string; date?: string; severity: "warn" | "danger" };

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
const hasSupabase = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const useStub = () => isE2E() || !hasSupabase();

export async function getAlertSummary(org_id: string): Promise<AlertSummary[]> {
  if (useStub()) {
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
  if (useStub()) {
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
  if (useStub()) {
    return listForecastDelta().filter((r) => r.org_id === org_id);
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase.from("forecast_delta").select("forecast_date, delta").eq("org_id", org_id);
  if (error) throw error;
  return (data as ForecastDelta[]) ?? [];
}

export async function getUpcomingEvents(org_id: string, daysAhead = 30): Promise<UpcomingEvent[]> {
  if (useStub()) {
    return listEventsStore(daysAhead)
      .filter((ev) => ev.org_id === org_id)
      .map((ev) => ({ event_date: ev.event_date, hall: ev.hall, name: ev.name, event_type: ev.event_type, attendees: ev.attendees }));
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

export async function getUpcomingTasks(org_id: string, daysAhead = 7): Promise<UpcomingTask[]> {
  if (useStub()) {
    const tasks = listTasks({ to: new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10) });
    return tasks.map((t) => ({ id: t.id, title: t.title, due_date: t.due_date, shift: t.shift, status: t.status, hall: t.hall }));
  }
  const supabase = supabaseClient();
  const limitDate = new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, due_date, shift, status, hall")
    .eq("org_id", org_id)
    .lte("due_date", limitDate)
    .in("status", ["pending", "in_progress"])
    .order("due_date", { ascending: true });
  if (error) throw error;
  return (data as UpcomingTask[]) ?? [];
}

export async function getAlerts(org_id: string): Promise<AlertItem[]> {
  if (useStub()) {
    return [
      { title: "Pedido retrasado PROV-21", date: "2026-02-10", severity: "warn" },
      { title: "Recepción incompleta ALB-884", date: "2026-02-09", severity: "danger" },
    ];
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase.from("alerts_view").select("title, date, severity").eq("org_id", org_id).limit(10);
  if (error) throw error;
  return (data as AlertItem[]) ?? [];
}

export async function getBreakfastForecast(org_id: string, daysAhead = 7): Promise<{ date: string; breakfasts: number }[]> {
  if (useStub()) {
    const today = new Date();
    const limit = new Date(today.getTime() + daysAhead * 86400000);
    return listForecastEntries()
      .filter((r) => r.org_id === org_id)
      .filter((r) => {
        const d = new Date(r.forecast_date);
        return d >= today && d <= limit;
      })
      .sort((a, b) => a.forecast_date.localeCompare(b.forecast_date))
      .map((r) => ({ date: r.forecast_date, breakfasts: r.breakfasts }));
  }
  const supabase = supabaseClient();
  const limitDate = new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("forecast_real_joined")
    .select("date, breakfasts")
    .eq("org_id", org_id)
    .lte("date", limitDate)
    .order("date", { ascending: true })
    .limit(14);
  if (error) throw error;
  return (data as any[])?.map((r) => ({ date: r.date, breakfasts: r.breakfasts })) ?? [];
}
