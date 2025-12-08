// app/api/focus/today/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type FocusMeta = {
  id: string;
  title: string;
  intro?: string | null;
  duration_min?: number | null;
};

type FocusItem = {
  id: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type TodayResponse =
  | { status: "ok"; meta: FocusMeta; items: FocusItem[] }
  | { status: "empty"; meta?: FocusMeta | null }
  | { status: "error"; error: string };

export async function GET() {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data: slot, error: slotError } = await supabase
    .from("dayprogram_slots")
    .select("content_id")
    .eq("slot_date", today)
    .eq("content_type", "focus")
    .order("slot_key", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (slotError) {
    console.error("focus/today slot error:", slotError);
    const body: TodayResponse = {
      status: "error",
      error: "Kon het focus-dagprogramma niet lezen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  if (!slot) {
    const body: TodayResponse = { status: "empty" };
    return NextResponse.json(body);
  }

  const { data: focus, error: focusError } = await supabase
    .from("focus_items")
    .select("id, title, intro, duration_min, items")
    .eq("id", slot.content_id)
    .maybeSingle();

  if (focusError || !focus) {
    console.error("focus/today focus error:", focusError);
    const body: TodayResponse = {
      status: "error",
      error: "Het focusmoment uit het dagprogramma kon niet worden geladen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const items = Array.isArray(focus.items) ? focus.items : [];

  const body: TodayResponse = {
    status: "ok",
    meta: {
      id: focus.id,
      title: focus.title,
      intro: focus.intro ?? null,
      duration_min: focus.duration_min ?? null,
    },
    items: items as FocusItem[],
  };

  return NextResponse.json(body);
}
