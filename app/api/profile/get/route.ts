import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Voor nu gebruiken we een anonieme 'user' totdat auth wordt toegevoegd.
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile", error);
    return NextResponse.json({ error: "PROFILE_LOAD_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}