import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase credentials not set" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  // 1. Haal artworks op
  const { data: artworks, error: artError } = await supabase
    .from("artworks")
    .select("*");

  if (artError || !artworks || artworks.length === 0) {
    return NextResponse.json({ ok: false, error: "No artworks found" });
  }

  // 2. Kies 6 willekeurige
  const shuffled = [...artworks].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 6);

  // 3. Tour aanmaken
  const today = new Date().toISOString().slice(0, 10);

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      title: "Testtour MuseaThuis",
      description: "Eenvoudige testtour zonder AI-teksten.",
      tour_type: "daily",
      status: "draft",
      planned_for_date: today
    })
    .select()
    .single();

  if (tourError || !tour) {
    return NextResponse.json(
      { ok: false, error: tourError?.message || "Error creating tour" },
      { status: 500 }
    );
  }

  // 4. Koppel de artworks + placeholderteksten
  let pos = 1;

  for (const art of selected) {
    // koppel het kunstwerk aan de tour
    await supabase.from("tour_items").insert({
      tour_id: tour.id,
      artwork_id: art.id,
      position: pos++
    });

    // placeholdertekst opslaan
    await supabase.from("artwork_texts").insert({
      artwork_id: art.id,
      language: "nl",
      text_type: "tour",
      content: `Placeholdertekst voor ${art.title}. Deze tekst wordt later vervangen door AI.`,
      duration_seconds: 180,
      is_ai_generated: false
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Testtour aangemaakt",
    tour_id: tour.id,
    artworks_count: selected.length
  });
}
