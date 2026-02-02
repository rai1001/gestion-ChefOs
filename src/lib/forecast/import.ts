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

export function parseForecastXlsx(buf: Buffer, isCsv = false): ForecastRow[] {
  const workbook = isCsv
    ? XLSX.read(buf.toString("utf8"), { type: "string" })
    : XLSX.read(buf, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // Read raw rows (header:1) to target fixed columns: A = Fecha, W = Desayunos (index 22)
  const json = XLSX.utils.sheet_to_json<any[]>(sheet, { defval: null, header: 1 });

  const normalizeDate = (val: any): string | null => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "number") return XLSX.SSF.format("yyyy-mm-dd", val);
    const str = String(val).trim();
    const m = str.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m) {
      const [, d, mo, y] = m;
      const year = y.length === 2 ? Number(`20${y}`) : Number(y);
      const dt = new Date(year, Number(mo) - 1, Number(d));
      return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
    }
    const native = new Date(str);
    return Number.isNaN(native.getTime()) ? null : native.toISOString().slice(0, 10);
  };

  const rows = json
    .map((row) => {
      const dateVal = row[0]; // columna A
      const breakfastsVal = row[22]; // columna W (0-index)
      const forecast_date = normalizeDate(dateVal);
      if (!forecast_date) return null;
      const breakfasts = Number(breakfastsVal ?? 0);
      if (Number.isNaN(breakfasts)) return null;
      return {
        forecast_date,
        guests: 0,
        breakfasts,
      };
    })
    .filter((r): r is ForecastRow => r !== null);

  // dedup by date, keep last value
  const dedup = new Map<string, ForecastRow>();
  for (const r of rows) dedup.set(r.forecast_date, r);
  return Array.from(dedup.values()).sort((a, b) => a.forecast_date.localeCompare(b.forecast_date));
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
