// app/api/tour/today/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = getSupabaseServerClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("tour_date", today)
    .eq("status", "published")
    .single();

  if (error || !tour) {
    return NextResponse.json({ status: "NO_TOUR_FOR_TODAY" });
  }

  const { data: items } = await supabase
    .from("tour_items")
    .select(
      `
      id,
      order_index,
      generated_text,
      artwork:artworks (
        id,
        museum,
        title,
        artist_name,
        dating_text,
        object_type,
        materials,
        image_url,
        image_thumbnail_url,
        location_city,
        location_country
      )
    `
    )
    .eq("tour_id", tour.id)
    .order("order_index", { ascending: true });

  return NextResponse.json({
    status: "OK",
    tour,
    items: items ?? [],
  });
}
