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

type ProfileBody = {
  display_name?: string | null;
  age_group?: string | null;
  gender?: string | null;
  province?: string | null;
  country?: string | null;
  has_museum_card?: boolean | null;
  education_level?: string | null;
  art_interest_level?: string | null;
  favorite_periods?: string | null;
  favorite_museums?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as ProfileBody | null;

    if (!body) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
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

    const { data: existing, error: existingError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", DEMO_USER_ID)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing profile", existingError);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update(payload)
        .eq("user_id", DEMO_USER_ID);

      if (updateError) {
        console.error("Error updating profile", updateError);
        return NextResponse.json({ error: "PROFILE_SAVE_ERROR" }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert(payload);

      if (insertError) {
        console.error("Error inserting profile", insertError);
        return NextResponse.json({ error: "PROFILE_SAVE_ERROR" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected error in POST /api/profile/update", e);
    return NextResponse.json({ error: "PROFILE_SAVE_ERROR" }, { status: 500 });
  }
}