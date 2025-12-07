import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("games")
    .insert({
      title: "Placeholder game",
      description: "Deze game is een placeholder voor de game-engine.",
      status: "draft",
      game_type: "quiz",
      is_premium: false
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, game: data });
}
