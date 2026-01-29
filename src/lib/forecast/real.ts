import { supabaseClient } from "../supabase/client";

export async function saveRealCounts(orgId: string, forecastDate: string, actualBreakfasts: number) {
  const supabase = supabaseClient();
  const row = {
    org_id: orgId,
    forecast_date: forecastDate,
    actual_breakfasts: actualBreakfasts,
  };
  const upsertResult = await supabase
    .from("forecasts")
    .upsert(row, { onConflict: "org_id,forecast_date" });

  await supabase.rpc("refresh_forecast_delta");
  return upsertResult;
}
