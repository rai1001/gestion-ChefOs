import { NextRequest, NextResponse } from "next/server";
import { receivePartial, finalizeReception, listAlerts } from "@/lib/receptions/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isE2E) return NextResponse.json({ status: "stub" });

  const body = await req.json();
  const rec = receivePartial(id, body.qty ?? 0, body.received_at ?? new Date().toISOString().slice(0, 10));
  return NextResponse.json({ status: "ok", reception: rec, alerts: listAlerts(), mode: "e2e" });
}

export async function PATCH(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isE2E) return NextResponse.json({ status: "stub" });
  const rec = finalizeReception(id);
  return NextResponse.json({ status: "ok", reception: rec, alerts: listAlerts(), mode: "e2e" });
}

