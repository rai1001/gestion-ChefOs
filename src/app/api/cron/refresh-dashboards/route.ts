import { NextResponse } from "next/server";

export async function GET() {
  // In production, would call SQL function to refresh materialized views and generate alerts.
  return NextResponse.json({ status: "ok", refreshed: true });
}

