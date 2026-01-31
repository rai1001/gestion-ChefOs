import { supabaseClient } from "@/lib/supabase/client";

export type AlertSummary = { org_id: string; alert_count: number };
export type ForecastDelta = { forecast_date: string; delta: number };
export type UpcomingEvent = { event_date: string; hall: string; name: string; event_type?: string | null; attendees: number };

export async function getAlertSummary(org_id: string): Promise<AlertSummary[]> {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) {
    return [{ org_id, alert_count: 2 }];
  }
  const supabase = supabaseClient();
  const { data, error } = await supabase.from("kpi_alert_counts").select("*").eq("org_id", org_id);
  if (error) throw error;
  return (data as AlertSummary[]) ?? [];
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
