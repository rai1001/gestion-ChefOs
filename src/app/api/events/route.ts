import { NextRequest, NextResponse } from "next/server";
import { listEventSheets, listEvents } from "@/lib/events/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const data = listEvents().filter((ev) => {
    if (from && ev.event_date < from) return false;
    if (to && ev.event_date > to) return false;
    return true;
  });

  if (isE2E) {
    return NextResponse.json({ data, mode: "e2e" });
  }

  // In stub mode we still return in-memory list so the UI has something to show.
  return NextResponse.json({ data, mode: "stub" });
}
