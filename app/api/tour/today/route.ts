import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: tour, error: tourError } = await supabase
      .from("tours")
      .select("*")
      .eq("date", today)
      .eq("status", "published")
      .single();

    if (tourError || !tour) {
      return NextResponse.json(
        { error: "NO_TOUR_FOR_TODAY" },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("tour_items")
      .select("id, tour_id, artwork_id, order_index")
      .eq("tour_id", tour.id)
      .order("order_index", { ascending: true });

    if (itemsError) {
      console.error(itemsError);
      return NextResponse.json(
        { error: "TOUR_ITEMS_ERROR" },
        { status: 500 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "NO_ITEMS_FOR_TOUR" },
        { status: 404 }
      );
    }

    const artworkIds = Array.from(new Set(items.map((i: any) => i.artwork_id)));

    const { data: artworks, error: artworksError } = await supabase
      .from("artworks")
      .select(
        "id, title, artist_name, year_from, year_to, image_url, description_primary"
      )
      .in("id", artworkIds);

    if (artworksError) {
      console.error(artworksError);
      return NextResponse.json(
        { error: "ARTWORKS_ERROR" },
        { status: 500 }
      );
    }

    const artworksById = new Map(
      (artworks ?? []).map((a: any) => [a.id, a])
    );

    const itemsWithArtworks = (items ?? []).map((item: any) => ({
      id: item.id,
      order_index: item.order_index,
      artwork_id: item.artwork_id,
      artwork: artworksById.get(item.artwork_id) ?? null,
    }));

    return NextResponse.json({
      tour: {
        id: tour.id,
        date: tour.date,
        title: tour.title,
        intro: tour.intro,
        is_premium: tour.is_premium,
        items: itemsWithArtworks,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "UNEXPECTED_ERROR" },
      { status: 500 }
    );
  }
}