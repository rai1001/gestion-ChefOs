import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/config";

const isE2E = () => process.env.NEXT_PUBLIC_E2E === "1" || process.env.E2E === "1";

export async function sendMagicLink(email: string) {
  if (!email) throw new Error("email required");
  if (isE2E()) return { ok: true, mode: "e2e" };

  const { url, anonKey } = getSupabaseConfig();
  const client = createClient(url, anonKey);
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/` : "http://localhost:3000/",
    },
  });
  if (error) throw new Error(error.message);
  return { ok: true, mode: "prod" };
}
