import { NextResponse } from "next/server";
import { listSuppliers } from "@/lib/purchases/catalog";

export async function GET() {
  const data = await listSuppliers();
  return NextResponse.json({ data, mode: process.env.NEXT_PUBLIC_E2E ? "e2e" : "stub" });
}
