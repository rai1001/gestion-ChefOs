import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { resetTasksStore, seedTask, listTasks } from "@/lib/tasks/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function GET() {
  if (isE2E) {
    return NextResponse.json({ data: listTasks(), mode: "e2e" });
  }
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = {
    id: body.id || randomUUID(),
    org_id: body.org_id || "org-dev",
    title: body.title || "",
    status: "pending" as const,
  };
  if (isE2E) {
    seedTask(task);
    return NextResponse.json({ status: "ok", id: task.id, mode: "e2e" });
  }
  return NextResponse.json({ status: "stub" });
}

export async function DELETE() {
  if (isE2E) {
    resetTasksStore();
    return NextResponse.json({ status: "reset", mode: "e2e" });
  }
  return NextResponse.json({ status: "stub" });
}
