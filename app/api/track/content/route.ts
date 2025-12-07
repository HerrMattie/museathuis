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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.source !== "string") {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("content_events").insert({
    user_id: null,
    artwork_id: body.artworkId ?? null,
    tour_id: body.tourId ?? null,
    game_id: body.gameId ?? null,
    focus_item_id: body.focusItemId ?? null,
    source: body.source,
    seconds_viewed: body.secondsViewed ?? null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "LOG_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}