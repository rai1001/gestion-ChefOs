export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // In CI we prefer running tests even if secrets are missing; fall back to harmless stub values.
  if (process.env.CI === "true" && (!url || !anonKey)) {
    return {
      url: url || "http://localhost:54321",
      anonKey: anonKey || "stub-anon-key",
    };
  }

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  return { url, anonKey };
}
