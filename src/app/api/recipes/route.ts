import { NextRequest, NextResponse } from "next/server";
import { listRecipes, upsertRecipeWithItems } from "@/lib/recipes/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const org_id = req.nextUrl.searchParams.get("org_id") ?? "org-dev";
  const data = listRecipes(org_id);
  return NextResponse.json({ data, mode: isE2E ? "e2e" : "stub" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org_id = body?.org_id ?? "org-dev";
  const name = body?.name;
  const servings = body?.servings ?? 1;
  const items = body?.items ?? [];
  if (!name || !Array.isArray(items)) return NextResponse.json({ error: "name + items requeridos" }, { status: 400 });
  const id = upsertRecipeWithItems({ org_id, name, servings, items });
  return NextResponse.json({ id, mode: isE2E ? "e2e" : "stub" }, { status: 201 });
}
