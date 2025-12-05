import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// Voor nu gebruiken we een anonieme 'user' totdat auth wordt toegevoegd.
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const payload = {
    user_id: DEMO_USER_ID,
    display_name: body.display_name ?? null,
    age_group: body.age_group ?? null,
    gender: body.gender ?? null,
    province: body.province ?? null,
    country: body.country ?? null,
    has_museum_card: body.has_museum_card ?? null,
    education_level: body.education_level ?? null,
    art_interest_level: body.art_interest_level ?? null,
    favorite_periods: body.favorite_periods ?? null,
    favorite_museums: body.favorite_museums ?? null,
  };

  const { error } = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("Error updating profile", error);
    return NextResponse.json(
      { error: "PROFILE_SAVE_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}