import { NextResponse } from "next/server";
import { startTask } from "@/lib/tasks/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!isE2E) return NextResponse.json({ status: "stub" });

  const { id } = await context.params;
  try {
    const updated = startTask(id);
    return NextResponse.json({ status: "ok", task: updated, mode: "e2e" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 400 });
  }
}
