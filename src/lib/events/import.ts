import crypto from "crypto";
import * as XLSX from "xlsx";
import { supabaseClient } from "../supabase/client";

type EventRow = {
  event_date: string;
  hall: string;
  name: string;
  event_type?: string | null;
  attendees: number;
  menu_name?: string | null;
  menu_id?: string | null;
};

export function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function parseCell(value: any) {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim();
  if (!str) return null;
  // Expected "Nombre | Tipo | PAX" or "Nombre;Tipo;PAX"
  const parts = str.split(/\\||;|,/).map((p) => p.trim()).filter(Boolean);
  let pax = 0;
  if (parts.length >= 1) {
    const maybeNumber = Number(parts[parts.length - 1]);
    if (!Number.isNaN(maybeNumber)) {
      pax = maybeNumber;
      parts.pop();
    }
  }
  const name = parts.shift() || "Evento";
  const event_type = parts.join(" ") || null;
  return { name, event_type, attendees: pax };
}

function parseSheet(sheet: XLSX.WorkSheet, sheetName: string): EventRow[] {
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null, header: 1, raw: false });
  if (json.length === 0) return [];
  const header = json[0] as any[];
  const baseHalls = header.slice(1).map((h) => String(h ?? "").trim()).filter(Boolean);
  const monthHint = String(header[0] ?? "").trim().toUpperCase();
  const monthMap: Record<string, number> = {
    ENE: 0, ENERO: 0,
    FEB: 1, FEBRERO: 1,
    MAR: 2, MARZO: 2,
    ABR: 3, ABRIL: 3,
    MAY: 4, MAYO: 4,
    JUN: 5, JUNIO: 5,
    JUL: 6, JULIO: 6,
    AGO: 7, AGOSTO: 7,
    SEP: 8, SEPT: 8, SEPTIEMBRE: 8,
    OCT: 9, OCTUBRE: 9,
    NOV: 10, NOVIEMBRE: 10,
    DIC: 11, DICIEMBRE: 11,
  };
  const monthIdx = monthMap[monthHint] ?? null;
  const yearMatch = sheetName.match(/(20\d{2})/);
  const sheetYear = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();

  const rows: EventRow[] = [];
  let currentMonth = monthIdx;

  for (let r = 1; r < json.length; r++) {
    const row = json[r] as any[];
    const first = row[0];

    // detect new month header inside same sheet
    if (typeof first === "string" && first.trim()) {
      const mh = String(first).trim().toUpperCase();
      if (monthMap[mh] !== undefined) {
        currentMonth = monthMap[mh];
        continue;
      }
    }

    // day rows
    const day = Number(first);
    if (!Number.isFinite(day) || day < 1 || day > 31 || currentMonth === null) continue;

    const event_date = new Date(sheetYear, currentMonth, day).toISOString().slice(0, 10);
    const halls = (json[0] as any[]).slice(1).map((h) => String(h ?? "").trim());

    halls.forEach((hall, idx) => {
      const hallName = hall || `SALON ${idx + 1}`;
      const cell = row[idx + 1];
      const parsed = parseCell(cell);
      if (!parsed) return;
      rows.push({
        event_date,
        hall: hallName,
        name: parsed.name,
        event_type: parsed.event_type,
        attendees: parsed.attendees,
      });
    });
  }

  // dedup by date+hall+name
  const dedup = new Map<string, EventRow>();
  for (const r of rows) {
    const key = `${r.event_date}-${r.hall}-${r.name}`;
    if (!dedup.has(key)) dedup.set(key, r);
  }
  return rows;
}

export function parseEventsXlsx(buf: Buffer): EventRow[] {
  const wb = XLSX.read(buf, { type: "buffer" }); // XLSX can also read CSV buffers
  const rows: EventRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    rows.push(...parseSheet(sheet, sheetName));
  }
  return rows;
}

function normalizeDate(input: string): string {
  const trimmed = input.trim();
  // Try native parse first
  const native = new Date(trimmed);
  if (!Number.isNaN(native.getTime())) {
    return native.toISOString().slice(0, 10);
  }
  // Try dd/mm/yy or dd/mm/yyyy
  const m = trimmed.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) {
    const [, d, mth, y] = m;
    const year = y.length === 2 ? Number(`20${y}`) : Number(y);
    const iso = new Date(year, Number(mth) - 1, Number(d));
    if (!Number.isNaN(iso.getTime())) return iso.toISOString().slice(0, 10);
  }
  // Fallback: return as-is to avoid dropping data
  return trimmed;
}

export async function upsertEvents(rows: EventRow[], orgId: string) {
  const supabase = supabaseClient();
  const payload = rows.map((r) => ({ ...r, org_id: orgId }));
  return supabase.from("events").upsert(payload, { onConflict: "org_id,event_date,hall" });
}

export async function upsertEventsFromXlsx(buf: Buffer, orgId: string) {
  const rows = parseEventsXlsx(buf);
  const hash = hashBuffer(buf);
  const supabase = supabaseClient();
  if (rows.length > 0) {
    const importDate = rows[0].event_date;
    await supabase.from("event_imports").upsert(
      [{ org_id: orgId, import_date: importDate, hash }],
      { onConflict: "org_id,import_date" }
    );
  }
  return upsertEvents(rows, orgId);
}
