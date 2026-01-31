import { NextResponse } from "next/server";
import { listSupplierProducts } from "@/lib/purchases/catalog";

export async function GET() {
  const data = await listSupplierProducts();
  return NextResponse.json({ data, mode: process.env.NEXT_PUBLIC_E2E ? "e2e" : "stub" });
}
