import { describe, expect, test } from "vitest";

describe("supabase auth clients", () => {
  test("browser client uses env vars and caches", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { createBrowserClient } = await import("@/lib/auth/supabase-browser");
    const first = createBrowserClient();
    const second = createBrowserClient();

    expect(first).toBe(second);
    expect(typeof first.from).toBe("function");
  });

  test("server client builds with cookies context", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    const { createServerClient } = await import("@/lib/auth/supabase-server");
    const fakeCookies = {
      get: () => undefined,
      set: () => undefined,
      delete: () => undefined,
    } as any;

    const client = createServerClient(fakeCookies);
    expect(typeof client.from).toBe("function");
  });
});
