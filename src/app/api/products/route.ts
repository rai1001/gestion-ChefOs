import { NextRequest, NextResponse } from "next/server";
import { listProducts, upsertProduct } from "@/lib/products/store";

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const org_id = req.nextUrl.searchParams.get("org_id") ?? "org-dev";
  const data = listProducts(org_id);
  return NextResponse.json({ data, mode: isE2E() ? "e2e" : "stub" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org_id = body?.org_id ?? "org-dev";
  const name = body?.name;
  const unit = body?.unit ?? "UD";
  const unit_price = Number(body?.unit_price ?? 0);
  if (!name) return NextResponse.json({ error: "name requerido" }, { status: 400 });
  const product = upsertProduct({ org_id, name, unit, unit_price });
  return NextResponse.json({ data: product, mode: isE2E() ? "e2e" : "stub" }, { status: 201 });
}
