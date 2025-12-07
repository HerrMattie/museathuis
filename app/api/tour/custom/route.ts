import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type CustomTourRequest = {
  title?: string;
  themeIds?: string[];
  museumNames?: string[];
  minYear?: number;
  maxYear?: number;
  maxWorks?: number;
  userId?: string; // later uit sessie halen
};

export async function POST(req: Request) {
  const body = (await req.json()) as CustomTourRequest;
  const supabase = supabaseServer();

  const {
    title,
    themeIds,
    museumNames,
    minYear,
    maxYear,
    maxWorks = 5,
    userId,
  } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "Geen userId meegegeven (later uit sessie halen)." },
      { status: 400 }
    );
  }

  let query = supabase
    .from("artworks")
    .select("id, title, artist_name, year_from, year_to, museum")
    .eq("is_tour_ready", true);

  if (minYear != null) {
    query = query.gte("year_from", minYear);
  }
  if (maxYear != null) {
    query = query.lte("year_to", maxYear);
  }
  if (museumNames && museumNames.length > 0) {
    query = query.in("museum", museumNames);
  }
  // themeIds kun je later koppelen via een artwork_tags tabel

  const { data: artworks, error: artworksError } = await query.limit(200);

  if (artworksError) {
    console.error(artworksError);
    return NextResponse.json(
      { error: "Fout bij ophalen artworks", details: artworksError.message },
      { status: 500 }
    );
  }

  if (!artworks || artworks.length === 0) {
    return NextResponse.json(
      { error: "Geen geschikte kunstwerken gevonden voor deze filters." },
      { status: 404 }
    );
  }

  const selected = artworks.slice(0, maxWorks);

  const tourTitle =
    title ||
    (selected[0]?.museum
      ? `Tour langs ${selected[0].museum}`
      : "Persoonlijke MuseaThuis-tour");

  const introText =
    "Deze tour is automatisch samengesteld op basis van jouw filters in de MuseaThuis-database. " +
    "De volgorde en selectie kun je later verfijnen.";

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      title: tourTitle,
      intro_text: introText,
      is_premium: true,
      is_personal: true,
      created_by_user_id: userId,
    })
    .select()
    .single();

  if (tourError || !tour) {
    console.error(tourError);
    return NextResponse.json(
      { error: "Kon tour niet aanmaken", details: tourError?.message },
      { status: 500 }
    );
  }

  const artworkIds = selected.map((a) => a.id);

  const { data: texts, error: textsError } = await supabase
    .from("artwork_texts")
    .select("id, artwork_id, text_type")
    .in("artwork_id", artworkIds)
    .eq("text_type", "primary");

  if (textsError) {
    console.error(textsError);
  }

  const textByArtwork = new Map<string, string>();
  if (texts) {
    for (const t of texts as any[]) {
      if (!textByArtwork.has(t.artwork_id)) {
        textByArtwork.set(t.artwork_id, t.id);
      }
    }
  }

  const tourItems = selected.map((artwork, index) => ({
    tour_id: tour.id,
    position: index + 1,
    artwork_id: artwork.id,
    text_id: textByArtwork.get(artwork.id) ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("tour_items")
    .insert(tourItems);

  if (itemsError) {
    console.error(itemsError);
    return NextResponse.json(
      {
        error: "Tour aangemaakt, maar fout bij opslaan tour-items",
        tourId: tour.id,
        details: itemsError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      tourId: tour.id,
      title: tour.title,
      works: selected.length,
    },
    { status: 201 }
  );
}
