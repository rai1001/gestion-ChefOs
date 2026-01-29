import { NextRequest, NextResponse } from "next/server";
import { upsertForecastsFromXlsx, upsertForecasts, parseForecastXlsx, hashBuffer } from "@/lib/forecast/import";
import { upsertEntries } from "@/lib/forecast/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const orgId = req.headers.get("x-org-id") || "org-dev";

    if (isE2E) {
      // accept JSON rows
      const body = await req.json();
      const rows = Array.isArray(body.rows) ? body.rows : body;
      upsertEntries(rows.map((r: any) => ({ ...r, org_id: orgId })));
      return NextResponse.json({ status: "ok", mode: "e2e", count: rows.length });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const rows = Array.isArray(body.rows) ? body.rows : body;
      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: "rows required" }, { status: 400 });
      }
      await upsertForecasts(rows, orgId);
      return NextResponse.json({ status: "ok", count: rows.length });
    }

    // multipart (file upload)
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isCsv = (file as File).name?.toLowerCase().endsWith(".csv");
    const rows = parseForecastXlsx(buffer, isCsv);
    if (rows.length === 0) {
      return NextResponse.json({ error: "no rows parsed" }, { status: 400 });
    }
    await upsertForecastsFromXlsx(buffer, orgId);
    const hash = hashBuffer(buffer);
    return NextResponse.json({ status: "ok", count: rows.length, hash });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "invalid" }, { status: 400 });
  }
}
