import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../config";

let cachedClient: SupabaseClient | null = null;

export function supabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const { url, anonKey } = getSupabaseConfig();
  cachedClient = createClient(url, anonKey);
  return cachedClient;
}
