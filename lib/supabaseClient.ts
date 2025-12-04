// lib/supabaseClient.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Eenvoudige type alias, zonder eigen Database-type
type GenericSupabaseClient = SupabaseClient<any, any, any>;

/**
 * Client voor gebruik in de browser / client components.
 * Gebruikt de anon key.
 */
export function supabaseBrowser(): GenericSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase browser client misconfiguratie: URL of ANON key ontbreekt"
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Client voor gebruik op de server (API routes, server actions).
 * Gebruikt de service role key voor achtergrondtaken (import, genereren).
 */
export function supabaseServer(): GenericSupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase server client misconfiguratie: URL of SERVICE_ROLE key ontbreekt"
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
