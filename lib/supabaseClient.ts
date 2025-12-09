import { createBrowserClient } from '@supabase/ssr';

// Dit is de client-side Supabase instantie. 
// Deze is alleen geschikt voor code die draait in de browser ('use client').
// De public key is veilig om bloot te stellen.
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// We exporteren ook de functie om de instantie te creëren voor andere componenten.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
