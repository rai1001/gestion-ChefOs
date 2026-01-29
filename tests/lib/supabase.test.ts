import { supabaseClient } from "@/lib/supabase/client";

test("client uses env vars and caches single instance", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

  const first = supabaseClient();
  const second = supabaseClient();

  expect(first).toBe(second);
  expect(first).toHaveProperty("from");
});
