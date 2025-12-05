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

  if (
    !body ||
    typeof body.tourId !== "string" ||
    typeof body.rating !== "number"
  ) {
    return NextResponse.json(
      { error: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const rating = Math.max(1, Math.min(5, Math.round(body.rating)));

  const { error } = await supabase.from("tour_ratings").insert({
    tour_id: body.tourId,
    user_id: null,
    rating,
  });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "RATING_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}