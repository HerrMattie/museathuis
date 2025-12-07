import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !body.focusItemId || !body.rating) {
    return NextResponse.json(
      { error: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "INVALID_RATING" },
      { status: 400 }
    );
  }

  const focusItemId = String(body.focusItemId);

  const { error } = await supabase.from("focus_ratings").insert({
    focus_item_id: focusItemId,
    rating,
  });

  if (error) {
    console.error("Error inserting focus rating", error);
    return NextResponse.json(
      { error: "RATING_INSERT_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}