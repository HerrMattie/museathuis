import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ ok: false, error: "Supabase credentials not set" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);

  // 1. Haal artworks op
  const { data: artworks } = await supabase.from("artworks").select("*");

  if (!artworks || artworks.length === 0) {
    return NextResponse.json({ ok: false, error: "No artworks" }, { status: 500 });
  }

  // 2. Kies 6 willekeurige
  const shuffled = [...artworks].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 6);

  // 3. Tour aanmaken
  const today = new Date().toISOString().slice(0, 10);

  const { data: tour } = await supabase
    .from("tours")
    .insert({
      title: "Testtour",
      description: "Eenvoudige testtour (nog zonder AI)",
      tour_type: "daily",
      status: "draft",
      planned_for_date: today
    })
    .select()
    .single();

  let p = 1;

  for (const art of selected) {
    await supabase.from("tour_items").insert({
      tour_id: tour.id,
      artwork_id: art.id,
      position: p++
    });

    await supabase.from("artwork_texts").insert({
      artwork_id: art.id,
      language: "nl",
      text_type: "tour",
      content: `Placeholdertekst voor ${art.title}.`,
      duration_seconds: 180,
      is_ai_generated: false
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Testtour aangemaakt",
    tour_id: tour.id
  });
}
