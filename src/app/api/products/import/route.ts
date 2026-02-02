import { NextRequest, NextResponse } from "next/server";
import { parseProductsBuffer, parseProductsText } from "@/lib/products/import";
import { upsertProduct, listProducts } from "@/lib/products/store";
import { mistralOcrFromBuffer } from "@/lib/ocr/mistral";
import { ocrResponseSchema } from "@/lib/ocr/schema";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const orgId = req.headers.get("x-org-id") || "org-dev";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") return NextResponse.json({ error: "Falta file" }, { status: 400 });
      const arrayBuffer = await (file as Blob).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mime = (file as Blob).type || "application/octet-stream";
      let items;
      if (/pdf|image\//i.test(mime)) {
        const ocr = await mistralOcrFromBuffer(buffer, mime, "generico");
        const parsed = ocrResponseSchema.parse(ocr);
        items = parseProductsText(parsed.text || "");
      } else {
        const isCsv = (file as File).name?.toLowerCase().endsWith(".csv");
        items = parseProductsBuffer(buffer, isCsv);
      }
      items.forEach((it) => upsertProduct({ org_id: orgId, ...it }));
      return NextResponse.json({ status: "ok", count: items.length, mode: isE2E ? "e2e" : "stub" }, { status: 201 });
    }
    // JSON fallback
    const body = await req.json();
    const rows = Array.isArray(body.rows) ? body.rows : body;
    rows.forEach((it: any) => upsertProduct({ org_id: orgId, name: it.name, unit: it.unit ?? "UD", unit_price: it.unit_price ?? 0 }));
    return NextResponse.json({ status: "ok", count: rows.length, mode: isE2E ? "e2e" : "stub" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "invalid" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id") ?? "org-dev";
  return NextResponse.json({ data: listProducts(orgId), mode: isE2E ? "e2e" : "stub" });
}
