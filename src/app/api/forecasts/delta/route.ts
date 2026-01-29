import { NextResponse } from "next/server";
import { listDelta } from "@/lib/forecast/store";

export async function GET() {
  const data = listDelta();
  return NextResponse.json({ data });
}
