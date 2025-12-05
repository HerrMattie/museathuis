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

  try {
    // Bestaat profiel al?
    const { data: existing, error: existingError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", DEMO_USER_ID)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing profile", existingError);
      return NextResponse.json(
        { error: "PROFILE_SAVE_ERROR_CHECK" },
        { status: 500 }
      );
    }

    let error = null;

    if (existing) {
      // Update bestaand profiel
      const result = await supabase
        .from("user_profiles")
        .update(payload)
        .eq("user_id", DEMO_USER_ID);

      error = result.error;
    } else {
      // Nieuw profiel aanmaken
      const result = await supabase
        .from("user_profiles")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error("Error saving profile", error);
      return NextResponse.json(
        { error: "PROFILE_SAVE_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected profile save error", e);
    return NextResponse.json(
      { error: "PROFILE_SAVE_ERROR" },
      { status: 500 }
    );
  }
}