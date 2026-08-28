import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses RLS via the service_role key. Server-side only — never import this
// from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
