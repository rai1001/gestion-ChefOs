import { NextRequest, NextResponse } from "next/server";
import { attachMenu } from "@/lib/events/store";

const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { menu_name } = body;
    const eventDate = params.id; // using date as id for e2e stub
    const orgId = body.org_id || "org-dev";

    if (isE2E) {
      attachMenu(orgId, eventDate, menu_name);
      return NextResponse.json({ status: "ok", mode: "e2e" });
    }

    return NextResponse.json({ status: "ok", menu_name });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "invalid" }, { status: 400 });
  }
}
