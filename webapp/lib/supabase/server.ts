import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@mobile/database";

// Cookie-scoped client — respects RLS as the signed-in user (or anonymous, if none).
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — ignore, proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}
