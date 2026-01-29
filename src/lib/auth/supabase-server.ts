import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../config";

export type CookieAdapter = {
  get(name: string): { name: string; value: string } | undefined;
  set(name: string, value: string, options?: any): void;
  delete?(name: string, options?: any): void;
};

export function createServerClient(cookies: CookieAdapter): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      get: (name: string) => cookies.get(name)?.value,
      set: (name: string, value: string, options?: any) => cookies.set(name, value, options),
      remove: (name: string, options?: any) => cookies.delete?.(name, options),
    },
  });
}
