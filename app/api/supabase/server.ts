import { createClient } from "@supabase/supabase-js";

export function createServerSupabase() {
  // Use service role key for server-side operations (bypasses RLS)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
