import { NextRequest, NextResponse } from "next/server";
import { saveRealCounts } from "@/lib/forecast/real";
import { updateActual } from "@/lib/forecast/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { org_id, forecast_date, actual_breakfasts } = body;
    if (!forecast_date || actual_breakfasts === undefined) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    if (isE2E) {
      updateActual(org_id || "org-dev", forecast_date, Number(actual_breakfasts));
      return NextResponse.json({ status: "ok", mode: "e2e" });
    }

    await saveRealCounts(org_id || "org-dev", forecast_date, Number(actual_breakfasts));
    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "invalid" }, { status: 400 });
  }
}
