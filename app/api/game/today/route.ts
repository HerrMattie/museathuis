import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("date", today)
    .eq("status", "published")
    .single();

  if (gameError || !game) {
    return NextResponse.json(
      { error: "NO_GAME_FOR_TODAY" },
      { status: 404 }
    );
  }

  const { data: items, error: itemsError } = await supabase
    .from("game_items")
    .select(
      "id, artwork_id, order_index, question, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3"
    )
    .eq("game_id", game.id)
    .order("order_index", { ascending: true });

  if (itemsError || !items || items.length === 0) {
    return NextResponse.json(
      { error: "NO_ITEMS_FOR_GAME" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    game: {
      id: game.id,
      date: game.date,
      title: game.title,
      intro: game.intro,
      is_premium: game.is_premium,
      items,
    },
  });
}