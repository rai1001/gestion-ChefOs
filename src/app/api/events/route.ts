import { NextRequest, NextResponse } from "next/server";
import { listEventSheets } from "@/lib/events/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(_req: NextRequest) {
  const data = listEventSheets();

  if (isE2E) {
    return NextResponse.json({ data, mode: "e2e" });
  }

  // In stub mode we still return in-memory list so the UI has something to show.
  return NextResponse.json({ data, mode: "stub" });
}
