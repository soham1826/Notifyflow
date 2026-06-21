import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://knjjylrhoogxmorvptgf.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_UvoAX3qfq7unvKe4ztyy9A_GhF0MLqc";
  return createBrowserClient(url, anonKey);
}
