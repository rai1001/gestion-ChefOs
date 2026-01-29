import crypto from "crypto";
import * as XLSX from "xlsx";
import { supabaseClient } from "../supabase/client";

type ForecastRow = {
  forecast_date: string; // ISO yyyy-mm-dd
  guests: number;
  breakfasts: number;
  actual_breakfasts?: number;
};

export function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function parseForecastXlsx(buf: Buffer): ForecastRow[] {
  const workbook = XLSX.read(buf, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });

  return json.map((row) => {
    const dateVal = row.fecha ?? row.date ?? row.Fecha ?? row.Date;
    const guestsVal = row.ocupacion ?? row.guests ?? row.Ocupacion ?? row.Guests ?? row.Occupancy;
    const breakfastsVal = row.desayunos ?? row.breakfasts ?? row.Desayunos ?? row.Breakfasts;

    const forecast_date = typeof dateVal === "string" ? dateVal : XLSX.SSF.format("yyyy-mm-dd", dateVal);
    return {
      forecast_date,
      guests: Number(guestsVal ?? 0),
      breakfasts: Number(breakfastsVal ?? 0),
    };
  });
}

export async function upsertForecasts(rows: ForecastRow[], orgId: string) {
  const supabase = supabaseClient();
  const payload = rows.map((r) => ({ ...r, org_id: orgId }));
  return supabase
    .from("forecasts")
    .upsert(payload, { onConflict: "org_id,forecast_date" });
}

export async function upsertForecastsFromXlsx(buf: Buffer, orgId: string) {
  const rows = parseForecastXlsx(buf);
  const hash = hashBuffer(buf);
  const supabase = supabaseClient();

  // register import (using first date as import_date anchor)
  if (rows.length > 0) {
    const importDate = rows[0].forecast_date;
    await supabase.from("forecast_imports").upsert(
      [{ org_id: orgId, import_date: importDate, hash }],
      { onConflict: "org_id,import_date" }
    );
  }

  return upsertForecasts(rows, orgId);
}
