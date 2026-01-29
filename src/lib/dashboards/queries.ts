import { supabaseClient } from "@/lib/supabase/client";

export type AlertSummary = { org_id: string; alert_count: number };
export type ForecastDelta = { forecast_date: string; delta: number };

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
