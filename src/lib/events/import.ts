import crypto from "crypto";
import * as XLSX from "xlsx";
import { supabaseClient } from "../supabase/client";

type EventRow = {
  event_date: string;
  attendees: number;
  menu_name?: string | null;
  menu_id?: string | null;
};

export function hashBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function parseEventsXlsx(buf: Buffer): EventRow[] {
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
  return json.map((row) => {
    const dateVal = row.fecha ?? row.date ?? row.Fecha ?? row.Date;
    const attendeesVal = row.asistentes ?? row.attendees ?? row.Asistentes ?? row.Attendees;
    const menuVal = row.menu ?? row.Menu ?? row.menu_name;
    const event_date = typeof dateVal === "string" ? dateVal : XLSX.SSF.format("yyyy-mm-dd", dateVal);
    return {
      event_date,
      attendees: Number(attendeesVal ?? 0),
      menu_name: menuVal ?? null,
    };
  });
}

export async function upsertEvents(rows: EventRow[], orgId: string) {
  const supabase = supabaseClient();
  const payload = rows.map((r) => ({ ...r, org_id: orgId }));
  return supabase.from("events").upsert(payload, { onConflict: "org_id,event_date" });
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
