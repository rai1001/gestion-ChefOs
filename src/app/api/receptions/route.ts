import { NextRequest, NextResponse } from "next/server";
import { createReception, listReceptions, resetReceptionsStore } from "@/lib/receptions/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  return NextResponse.json({ data: listReceptions(), mode: isE2E ? "e2e" : "stub" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!isE2E) return NextResponse.json({ status: "stub" });
  const rec = createReception({
    id: body.id || crypto.randomUUID(),
    org_id: body.org_id || "org-dev",
    expected_qty: body.expected_qty ?? 0,
    expected_date: body.expected_date ?? new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json({ status: "ok", id: rec.id, mode: "e2e" });
}

export async function DELETE() {
  if (isE2E) {
    resetReceptionsStore();
    return NextResponse.json({ status: "reset", mode: "e2e" });
  }
  return NextResponse.json({ status: "stub" });
}

