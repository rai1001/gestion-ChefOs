import { NextResponse } from "next/server";
import { listAlerts } from "@/lib/receptions/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  return NextResponse.json({ data: listAlerts(), mode: isE2E ? "e2e" : "stub" });
}

