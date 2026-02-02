import { NextRequest, NextResponse } from "next/server";
import { mistralOcrFromBuffer } from "@/lib/ocr/mistral";
import { ocrResponseSchema, recetaOcrSchema, type OcrKind } from "@/lib/ocr/schema";
import { parseRecipeImport } from "@/lib/recipes/import";
import { upsertRecipeWithItems } from "@/lib/recipes/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const kind = (req.nextUrl.searchParams.get("kind") || "generico") as OcrKind;

    if (isE2E) {
      const stub = ocrResponseSchema.parse({
        kind,
        text: "Texto OCR demo",
        items: kind === "menu" ? [{ name: "Demo", details: "Stub OCR" }] : undefined,
      });
      return NextResponse.json({ data: stub, mode: "e2e" });
    }

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Usa multipart/form-data con 'file'" }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Falta file" }, { status: 400 });
    }

    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = (file as Blob).type || "application/octet-stream";

    const data = await mistralOcrFromBuffer(buffer, mime, kind);
    if (data.kind === "receta") {
      const parsed = recetaOcrSchema.parse(data);
      if (parsed.table && parsed.table.length) {
        const items = parsed.table.map((row) => ({
          product_name: row.producto,
          unit: row.unidad ?? "UD",
          gross_qty: row.cantidad_bruta ?? row.cantidad_neta ?? 0,
          net_qty: row.cantidad_neta ?? row.cantidad_bruta ?? 0,
          waste_pct: row.desperdicio_pct ?? 0,
          unit_price: row.precio_unitario ?? 0,
        }));
        const id = upsertRecipeWithItems({ org_id: "org-dev", name: parsed.title ?? "Receta OCR", servings: 1, items });
        return NextResponse.json({ data: { ...parsed, recipe_id: id }, mode: "prod" });
      }
    }
    return NextResponse.json({ data, mode: "prod" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "invalid" }, { status: 400 });
  }
}
