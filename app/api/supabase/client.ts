import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs"; // use in React components

export function useClerkSupabase() {
  const { session } = useSession();
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      async accessToken() {
        // Clerk client session token (no template needed with the new integration)
        return session?.getToken() ?? null;
      },
    }
  );
  return client;
}
