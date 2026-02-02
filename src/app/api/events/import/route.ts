import { NextRequest, NextResponse } from "next/server";
import { parseEventsXlsx, upsertEventsFromXlsx, upsertEvents, hashBuffer } from "@/lib/events/import";
import { upsertEventEntries } from "@/lib/events/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const orgId = req.headers.get("x-org-id") || "org-dev";

    if (isE2E || !hasSupabase) {
      if (contentType.includes("multipart/form-data")) {
        const form = await req.formData();
        const file = form.get("file");
        if (!file || typeof file === "string") {
          return NextResponse.json({ error: "file required" }, { status: 400 });
        }
        const buffer = Buffer.from(await (file as Blob).arrayBuffer());
        const rows = parseEventsXlsx(buffer).map((r) => ({ ...r, org_id: orgId }));
        upsertEventEntries(rows);
        return NextResponse.json({ status: "ok", mode: isE2E ? "e2e" : "stub", count: rows.length });
      }
      const body = await req.json();
      const rows = Array.isArray(body.rows) ? body.rows : body;
      upsertEventEntries(rows.map((r: any) => ({ ...r, org_id: orgId })));
      return NextResponse.json({ status: "ok", mode: isE2E ? "e2e" : "stub", count: rows.length });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const rows = Array.isArray(body.rows) ? body.rows : body;
      await upsertEvents(rows, orgId);
      return NextResponse.json({ status: "ok", count: rows.length });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rows = parseEventsXlsx(buffer);
    await upsertEventsFromXlsx(buffer, orgId);
    const hash = hashBuffer(buffer);
    return NextResponse.json({ status: "ok", count: rows.length, hash });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "invalid" }, { status: 400 });
  }
}
