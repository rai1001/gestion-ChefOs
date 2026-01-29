import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./lib/config";

const PUBLIC_ROUTES = ["/", "/login", "/auth/callback"];

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const isE2E = process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";
  if (isE2E) return res;

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options?: any) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options?: any) => {
        res.cookies.set({ name, value: "", expires: new Date(0), ...options });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((p) => pathname.startsWith(p)) || pathname.startsWith("/public");

  if (!session && !isPublic && !pathname.startsWith("/_next") && !pathname.match(/\.\w+$/)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/(.*)"],
};
