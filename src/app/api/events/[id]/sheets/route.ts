import { NextRequest, NextResponse } from "next/server";
import { listEventSheets } from "@/lib/events/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (isE2E) {
    const data = listEventSheets().filter((e) => e.event_date === params.id);
    return NextResponse.json({ data, mode: "e2e" });
  }
  // stubbed response
  return NextResponse.json({ data: [], mode: "stub" });
}
