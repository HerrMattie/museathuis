import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const body = await request.json().catch(() => null);

  if (!body || typeof body.source !== "string") {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const { error } = await supabase.from("content_events").insert({
    user_id: session?.user.id ?? null,
    artwork_id: body.artworkId ?? null,
    tour_id: body.tourId ?? null,
    game_id: body.gameId ?? null,
    focus_item_id: body.focusItemId ?? null,
    source: body.source,
    seconds_viewed: body.secondsViewed ?? null,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "LOG_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}