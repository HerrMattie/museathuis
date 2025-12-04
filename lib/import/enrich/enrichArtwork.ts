// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL of Anon key ontbreekt. Check je environment variables.");
}

/**
 * Client voor gebruik in de browser (public anon key).
 */
export const supabaseBrowser = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Client met service role, alleen op de server gebruiken.
 */
export const supabaseServer = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ontbreekt");
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false
    }
  });
};

/**
 * Backwards compatible aliassen:
 * - supabaseBrowserClient  (zelfde als supabaseBrowser)
 * - supabaseServiceRoleClient (zelfde als supabaseServer)
 * Zo hoeven bestaande imports niet aangepast te worden.
 */
export const supabaseBrowserClient = supabaseBrowser;
export const supabaseServiceRoleClient = supabaseServer;

export default supabaseBrowser;
