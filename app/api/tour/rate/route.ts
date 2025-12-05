import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

type Body = {
  tour_id: string;
  rating: number;
};

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;

    if (!body || !body.tour_id || typeof body.rating !== "number") {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const rating = Math.round(body.rating);
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "INVALID_RATING" }, { status: 400 });
    }

    // Bestaat de tour?
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("id")
      .eq("id", body.tour_id)
      .maybeSingle();

    if (tourError || !tour) {
      return NextResponse.json({ error: "TOUR_NOT_FOUND" }, { status: 404 });
    }

    // Bestaande rating voor deze user/tour?
    const { data: existing, error: existingError } = await supabase
      .from("tour_ratings")
      .select("id")
      .eq("tour_id", body.tour_id)
      .eq("user_id", DEMO_USER_ID)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing rating", existingError);
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("tour_ratings")
        .update({
          rating,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating rating", updateError);
        return NextResponse.json({ error: "RATING_SAVE_ERROR" }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase.from("tour_ratings").insert({
        tour_id: body.tour_id,
        user_id: DEMO_USER_ID,
        rating,
      });

      if (insertError) {
        console.error("Error inserting rating", insertError);
        return NextResponse.json({ error: "RATING_SAVE_ERROR" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected error in POST /api/tour/rate", e);
    return NextResponse.json({ error: "RATING_SAVE_ERROR" }, { status: 500 });
  }
}