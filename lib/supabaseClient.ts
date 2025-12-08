import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables ontbreken (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

export type PublicSupabaseClient = SupabaseClient;
// Als je een Database type hebt, kun je dit strakker maken met: SupabaseClient<Database>

let browserClient: PublicSupabaseClient | null = null;

/**
 * Client voor gebruik in components en andere client-side code.
 * Gebruikt de public anon key.
 */
export function supabaseBrowser(): PublicSupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("supabaseBrowser() mag alleen in de browser worden gebruikt.");
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return browserClient;
}

/**
 * Client voor gebruik in API routes en backend-taken (service role key).
 * Geen sessie-opslag.
 */
export function supabaseServer(): PublicSupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ontbreekt. Stel deze in de Vercel environment variables in."
    );
  }

  return createClient(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
