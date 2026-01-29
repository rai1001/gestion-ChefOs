import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../config";

let browserClient: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  const { url, anonKey } = getSupabaseConfig();
  browserClient = createSupabaseBrowserClient(url, anonKey);
  return browserClient;
}
