
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type TourSlotSummary = {
  id: string;
  title: string;
  intro?: string | null;
  is_premium: boolean;
  slot_key: string | null;
};

type TourTodayListOk = {
  status: "ok";
  date: string;
  items: TourSlotSummary[];
};

type TourTodayListEmpty = {
  status: "empty";
  date: string;
  items: TourSlotSummary[];
};

type TourTodayListError = {
  status: "error";
  error: string;
};

type TourTodayListResponse =
  | TourTodayListOk
  | TourTodayListEmpty
  | TourTodayListError;

export async function GET() {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // 1. Slots voor tours van vandaag ophalen
  const { data: slots, error: slotError } = await supabase
    .from("v_dayprogram_today")
    .select("slot_key, content_type, content_id, is_premium")
    .eq("content_type", "tour")
    .order("slot_key", { ascending: true });

  if (slotError) {
    console.error("tour/today list slot error:", slotError);
    const body: TourTodayListResponse = {
      status: "error",
      error: "Kon de tours van vandaag niet laden.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  if (!slots || slots.length === 0) {
    const body: TourTodayListResponse = {
      status: "empty",
      date: today,
      items: [],
    };
    return NextResponse.json(body);
  }

  const tourIds = Array.from(
    new Set(
      slots
        .map((s: any) => s.content_id)
        .filter((id: any): id is string => Boolean(id))
    )
  );

  if (tourIds.length === 0) {
    const body: TourTodayListResponse = {
      status: "empty",
      date: today,
      items: [],
    };
    return NextResponse.json(body);
  }

  // 2. Bijbehorende tours ophalen
  const { data: tours, error: tourError } = await supabase
    .from("tours")
    .select("id, title, intro")
    .in("id", tourIds);

  if (tourError) {
    console.error("tour/today list tour error:", tourError);
    const body: TourTodayListResponse = {
      status: "error",
      error: "Kon de tours van vandaag niet laden.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const tourMap = new Map<string, { id: string; title: string; intro?: string | null }>();
  (tours ?? []).forEach((t: any) => {
    tourMap.set(t.id, t);
  });

  const items: TourSlotSummary[] = (slots ?? [])
    .map((slot: any) => {
      const t = tourMap.get(slot.content_id);
      if (!t) return null;

      return {
        id: t.id,
        title: t.title,
        intro: t.intro ?? null,
        is_premium: Boolean(slot.is_premium),
        slot_key: slot.slot_key ?? null,
      } as TourSlotSummary;
    })
    .filter((x): x is TourSlotSummary => Boolean(x))
    .slice(0, 3); // maximaal 3 tours tonen

  if (items.length === 0) {
    const body: TourTodayListResponse = {
      status: "empty",
      date: today,
      items: [],
    };
    return NextResponse.json(body);
  }

  const body: TourTodayListResponse = {
    status: "ok",
    date: today,
    items,
  };

  return NextResponse.json(body);
}
