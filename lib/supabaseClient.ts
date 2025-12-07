// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Pas deze type eventueel aan naar jouw Database type uit Supabase
// import type { Database } from "@/types/supabase";
// type SupabaseClientType = SupabaseClient<Database>;
type SupabaseClientType = ReturnType<typeof createClient>;

/**
 * Client-side Supabase client (browser)
 * Gebruikt ALLEEN de publieke anon key.
 */
export function supabaseBrowser(): SupabaseClientType {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL of NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt"
    );
  }

  return createClient(url, anonKey);
}

/**
 * Server-side Supabase client
 * Probeert eerst de service role key te pakken, valt anders terug op de anon key.
 * Ondersteunt zowel SUPABASE_URL als NEXT_PUBLIC_SUPABASE_URL.
 */
export function supabaseServer(): SupabaseClientType {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase environment variables ontbreken (SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY of NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createClient(url, serviceRoleKey);
}

/**
 * Alias voor nieuwe code: gebruikt dezelfde serverclient.
 */
export function getSupabaseServer(): SupabaseClientType {
  return supabaseServer();
}
