import { NextRequest, NextResponse } from "next/server";
import { parseRecipeImport } from "@/lib/recipes/import";
import { upsertRecipeWithItems } from "@/lib/recipes/store";
import { listProducts, findProductByName, upsertProduct } from "@/lib/products/store";

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
      const name = (form.get("name") as string) || (file as any).name || "Receta importada";
      const servings = Number(form.get("servings")) || 1;
      const date = (form.get("date") as string) || undefined;
      const imported = await parseRecipeImport(buffer, { filename: (file as any).name, name, servings, date });
      const products = listProducts(orgId);
      const items = imported.items.map((it) => {
        const found = findProductByName(orgId, it.product_name);
        if (found) return { ...it, unit_price: it.unit_price || found.unit_price, unit: it.unit || found.unit };
        if (!found && it.unit_price > 0) {
          upsertProduct({ org_id: orgId, name: it.product_name, unit: it.unit || "UD", unit_price: it.unit_price });
        }
        return it;
      });
      const id = upsertRecipeWithItems({ org_id: orgId, name: imported.name, servings: imported.servings, date: imported.date, items });
      return NextResponse.json({ id, summary: { total_cost: imported.total_cost, items: items.length }, mode: isE2E ? "e2e" : "stub" }, { status: 201 });
    }

    const body = await req.json();
    const buffer = Buffer.from(body?.file_base64 ?? "", "base64");
    const name = body?.name ?? "Receta importada";
    const servings = body?.servings ?? 1;
    const date = body?.date;
    const imported = await parseRecipeImport(buffer, { filename: "upload", name, servings, date });
    const products = listProducts(orgId);
    const items = imported.items.map((it) => {
      const found = findProductByName(orgId, it.product_name);
      if (found) return { ...it, unit_price: it.unit_price || found.unit_price, unit: it.unit || found.unit };
      if (!found && it.unit_price > 0) {
        upsertProduct({ org_id: orgId, name: it.product_name, unit: it.unit || "UD", unit_price: it.unit_price });
      }
      return it;
    });
    const id = upsertRecipeWithItems({ org_id: orgId, name: imported.name, servings: imported.servings, date: imported.date, items });
    return NextResponse.json({ id, summary: { total_cost: imported.total_cost, items: items.length }, mode: isE2E ? "e2e" : "stub" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "invalid" }, { status: 400 });
  }
}
