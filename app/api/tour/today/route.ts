// app/api/tour/today/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type TourMeta = {
  id: string;
  title: string;
  subtitle?: string | null;
  intro?: string | null;
};

type TourItem = {
  id: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type TodayResponse =
  | { status: "ok"; meta: TourMeta; items: TourItem[] }
  | { status: "empty"; meta?: TourMeta | null }
  | { status: "error"; error: string };

export async function GET() {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // 1. Slot voor vandaag zoeken
  const { data: slot, error: slotError } = await supabase
    .from("dayprogram_slots")
    .select("content_id")
    .eq("slot_date", today)
    .eq("content_type", "tour")
    .order("slot_key", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (slotError) {
    console.error("tour/today slot error:", slotError);
    const body: TodayResponse = {
      status: "error",
      error: "Kon het dagprogramma voor vandaag niet lezen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  if (!slot) {
    const body: TodayResponse = { status: "empty" };
    return NextResponse.json(body);
  }

  // 2. Tour zelf ophalen
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, title, intro, items")
    .eq("id", slot.content_id)
    .maybeSingle();

  if (tourError || !tour) {
    console.error("tour/today tour error:", tourError);
    const body: TodayResponse = {
      status: "error",
      error: "De tour uit het dagprogramma kon niet worden geladen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const items = Array.isArray(tour.items) ? tour.items : [];

  const body: TodayResponse = {
    status: "ok",
    meta: {
      id: tour.id,
      title: tour.title,
      intro: tour.intro ?? null,
    },
    items: items as TourItem[],
  };

  return NextResponse.json(body);
}
