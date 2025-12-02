// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

export const supabaseService = createClient(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);
