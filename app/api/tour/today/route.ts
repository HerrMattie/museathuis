import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayStr = toDateOnly(today);

    // Gepubliceerde tour voor vandaag ophalen
    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("id, date, title, intro, is_premium, status")
      .eq("date", todayStr)
      .eq("status", "published")
      .maybeSingle();

    if (tourError) {
      console.error("Error loading tour for today", tourError);
      return NextResponse.json({ error: "TOUR_LOAD_ERROR" }, { status: 500 });
    }

    if (!tour) {
      return NextResponse.json(
        { code: "NO_TOUR_FOR_TODAY", message: "Er is nog geen gepubliceerde tour voor vandaag." },
        { status: 200 }
      );
    }

    // Items + artworks via join (geen view nodig aan API-kant)
    const { data: items, error: itemsError } = await supabase
      .from("tour_items")
      .select(`
        id,
        order_index,
        text_short,
        text_long,
        audio_url,
        tags,
        artwork:artworks (
          id,
          title,
          artist_name,
          artist_normalized,
          dating_text,
          year_from,
          year_to,
          museum,
          location_city,
          location_country,
          image_url
        )
      `)
      .eq("tour_id", tour.id)
      .order("order_index", { ascending: true });

    if (itemsError) {
      console.error("Error loading tour items", itemsError);
      return NextResponse.json({ error: "TOUR_ITEMS_LOAD_ERROR" }, { status: 500 });
    }

    // Ratings samenvatting
    const { data: ratingAgg, error: ratingError } = await supabase
      .from("tour_ratings")
      .select("rating")
      .eq("tour_id", tour.id);

    let averageRating: number | null = null;
    let ratingCount = 0;

    if (!ratingError && ratingAgg && ratingAgg.length > 0) {
      ratingCount = ratingAgg.length;
      const sum = ratingAgg.reduce((acc: number, cur: any) => acc + (cur.rating ?? 0), 0);
      averageRating = sum / ratingCount;
    }

    return NextResponse.json({
      tour,
      items: items ?? [],
      ratingSummary: {
        averageRating,
        ratingCount,
      },
    });
  } catch (e) {
    console.error("Unexpected error in GET /api/tour/today", e);
    return NextResponse.json({ error: "TOUR_TODAY_FAILED" }, { status: 500 });
  }
}