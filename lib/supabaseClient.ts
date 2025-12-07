import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables ontbreken (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
  );
}

export type PublicSupabaseClient = SupabaseClient;

// Singleton voor browser/client-side gebruik
let browserClient: PublicSupabaseClient | null = null;

/**
 * Client voor gebruik in components en andere client-side code.
 */
export function supabaseBrowser(): PublicSupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/**
 * Client voor gebruik in API routes en backend-taken (service role key).
 */
export function supabaseServer(): PublicSupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY ontbreekt. Stel deze in de Vercel environment variables in."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Directe client indien ergens `supabase` wordt gebruikt
export const supabase: PublicSupabaseClient = supabaseBrowser();
