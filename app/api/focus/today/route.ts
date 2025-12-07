import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: schedule, error: scheduleError } = await supabase
    .from("focus_schedule")
    .select("id, date, focus_item_id")
    .eq("date", today)
    .single();

  if (scheduleError || !schedule) {
    return NextResponse.json(
      { error: "NO_FOCUS_FOR_TODAY" },
      { status: 404 }
    );
  }

  const { data: focusItem, error: focusError } = await supabase
    .from("focus_items")
    .select("id, artwork_id, long_text, audio_url")
    .eq("id", schedule.focus_item_id)
    .single();

  if (focusError || !focusItem) {
    return NextResponse.json(
      { error: "FOCUS_ITEM_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artworks")
    .select(
      "id, title, artist_name, year_from, year_to, image_url, description_primary"
    )
    .eq("id", focusItem.artwork_id)
    .single();

  if (artworkError || !artwork) {
    return NextResponse.json(
      { error: "ARTWORK_NOT_FOUND" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    focus: {
      id: focusItem.id,
      date: schedule.date,
      long_text: focusItem.long_text,
      audio_url: focusItem.audio_url,
      artwork,
    },
  });
}