import { NextRequest, NextResponse } from "next/server";
import { buildSheet } from "@/lib/purchases/build-sheet";
import { getSheet, saveSheet } from "@/lib/purchases/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = body.items ?? [];
  const sheet = buildSheet(items, new Date());
  saveSheet(sheet);

  if (isE2E) {
    return NextResponse.json({ data: sheet, mode: "e2e" });
  }
  // In non-E2E, this would write to DB and return saved sheet metadata.
  return NextResponse.json({ data: sheet, mode: "stub" });
}

export async function GET() {
  return NextResponse.json({ data: getSheet(), mode: isE2E ? "e2e" : "stub" });
}

