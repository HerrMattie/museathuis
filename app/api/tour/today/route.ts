
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type TourMeta = {
  id: string;
  title: string;
  subtitle?: string | null;
  intro?: string | null;
};

type TourItem = {
  id?: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type TourTodayOk = {
  status: "ok";
  meta: TourMeta;
  items: TourItem[];
};

type TourTodayEmpty = {
  status: "empty";
};

type TourTodayError = {
  status: "error";
  error: string;
};

type TourTodayResponse = TourTodayOk | TourTodayEmpty | TourTodayError;

export async function GET() {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // 1. Probeer tour uit dagprogramma
  const { data: slot, error: slotError } = await supabase
    .from("v_dayprogram_today")
    .select("slot_date, slot_key, content_type, content_id, is_premium")
    .eq("content_type", "tour")
    .order("slot_key", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (slotError) {
    console.error("tour/today slot error:", slotError);
  }

  let tourId: string | null = slot?.content_id ?? null;

  // 2. Fallback naar meest recente gepubliceerde tour als er geen slot is
  if (!tourId) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("tours")
      .select("id")
      .eq("status", "published")
      .order("publish_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      console.error("tour/today fallback error:", fallbackError);
    }

    if (fallback?.id) {
      tourId = fallback.id;
    }
  }

  // 3. Als er nog steeds geen tourId is, is er echt geen tour
  if (!tourId) {
    const body: TourTodayResponse = { status: "empty" };
    return NextResponse.json(body);
  }

  // 4. Tour ophalen
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, title, intro, items")
    .eq("id", tourId)
    .maybeSingle();

  if (tourError || !tour) {
    console.error("tour/today tour error:", tourError);
    const body: TourTodayResponse = {
      status: "error",
      error: "De tour kon niet worden geladen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const items = Array.isArray(tour.items) ? (tour.items as TourItem[]) : [];

  const body: TourTodayResponse = {
    status: "ok",
    meta: {
      id: tour.id,
      title: tour.title,
      intro: tour.intro ?? null,
    },
    items,
  };

  return NextResponse.json(body);
}
