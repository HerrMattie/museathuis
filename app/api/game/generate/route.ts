import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Simpele placeholder-API: maakt een concept game aan.
// Later kun je hier de echte game-generatie aan koppelen.
export async function POST() {
  const supabase = supabaseServer() as any;

  const { data, error } = await supabase
    .from("games")
    .insert(
      {
        title: "Placeholder game",
        description: "TODO: implement game generation",
        status: "draft",
        game_type: "quiz",
        is_premium: false,
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error creating game", error);
    return NextResponse.json(
      { error: "Fout bij aanmaken van game" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      game: data,
    },
    { status: 200 }
  );
}
