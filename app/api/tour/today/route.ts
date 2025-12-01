import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type ArtworkRow = {
  id: number | string;
  title: string | null;
  artist_name: string | null;
  museum?: string | null;
  location_city?: string | null;
};

export async function GET() {
  // Haal 3 echte werken op – pas evt. tabel/kolomnamen aan
  const { data, error } = await supabaseServer
    .from("artworks")
    .select("id, title, artist_name, location_city, collection_name, museum")
    .limit(3);

  if (error) {
    console.error("Supabase error tour/today:", error);
    return NextResponse.json(
      { error: "Kon kunstwerken niet ophalen" },
      { status: 500 }
    );
  }

  const artworks = (data as ArtworkRow[]) ?? [];

  const works = artworks.map((row) => ({
    id: String(row.id),
    title: row.title ?? "Zonder titel",
    artist: row.artist_name ?? "Onbekende kunstenaar",
    museum:
      row.museum ??
      row.location_city ??
      "Onbekend museum",
  }));

  const tour = {
    id: "db-test-tour",
    title: "Oefentour met echte kunstwerken",
    intro:
      "Deze oefentour bestaat uit drie echte records uit de database. Later vervang je dit door een geplande tour uit het CRM, maar de voorkant kan zo blijven.",
    durationMinutes: 3 * 3, // grove schatting: 3 minuten per werk
    works,
  };

  return NextResponse.json(tour);
}
