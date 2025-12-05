import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tourId = url.searchParams.get("id");

  if (!tourId) {
    return NextResponse.json({ error: "MISSING_TOUR_ID" }, { status: 400 });
  }

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, date, title, intro, is_premium, status")
    .eq("id", tourId)
    .maybeSingle();

  if (tourError || !tour) {
    return NextResponse.json({ error: "TOUR_NOT_FOUND" }, { status: 404 });
  }

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
        museum,
        image_url
      )
    `)
    .eq("tour_id", tourId)
    .order("order_index", { ascending: true });

  if (itemsError) {
    console.error("Error loading tour items for CRM", itemsError);
    return NextResponse.json({ error: "ITEMS_LOAD_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ tour, items: items ?? [] });
}