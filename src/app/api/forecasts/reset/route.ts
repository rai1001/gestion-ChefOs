import { NextResponse } from "next/server";
import { resetStore } from "@/lib/forecast/store";

export async function POST() {
  resetStore();
  return NextResponse.json({ status: "reset" });
}
