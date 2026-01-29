import { NextRequest, NextResponse } from "next/server";
import { createShift, listShifts, resetShiftsStore } from "@/lib/turnos/store";
import { randomUUID } from "crypto";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  return NextResponse.json({ data: listShifts(), mode: isE2E ? "e2e" : "stub" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!isE2E) return NextResponse.json({ status: "stub" });
  const shift = createShift({
    id: body.id || randomUUID(),
    org_id: body.org_id || "org-dev",
    shift_date: body.shift_date || new Date().toISOString().slice(0, 10),
    name: body.name || "Turno",
    employee_id: body.employee_id,
    vacation: body.vacation ?? false,
  });
  return NextResponse.json({ status: "ok", id: shift.id, mode: "e2e" });
}

export async function DELETE() {
  if (isE2E) {
    resetShiftsStore();
    return NextResponse.json({ status: "reset", mode: "e2e" });
  }
  return NextResponse.json({ status: "stub" });
}

