import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile", error);
      return NextResponse.json({ error: "PROFILE_LOAD_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ profile: profile ?? null });
  } catch (e) {
    console.error("Unexpected error in GET /api/profile/get", e);
    return NextResponse.json({ error: "PROFILE_LOAD_ERROR" }, { status: 500 });
  }
}