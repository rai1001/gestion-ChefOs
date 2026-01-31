import { NextRequest, NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/auth/magic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email as string | undefined;
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    const res = await sendMagicLink(email);
    return NextResponse.json(res, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "error" }, { status: 400 });
  }
}
