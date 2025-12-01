// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Deze controle voorkomt vage runtime errors in Vercel
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt. ' +
      'Controleer je .env.local en de Environment Variables in Vercel.'
  );
}

// Eventueel kun je hier later Database generics toevoegen, nu houden we het generiek
export const supabaseServerClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
