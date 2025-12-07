import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Simpele placeholder-API: maakt een concept focus-sessie aan.
// Later kun je hier de echte AI-generatie aan koppelen.
export async function POST() {
  const supabase = supabaseServer() as any;

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert(
      {
        title: "Placeholder focus",
        description: "TODO: implement focus generation",
        status: "draft",
        is_premium: false,
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error creating focus session", error);
    return NextResponse.json(
      { error: "Fout bij aanmaken van focus-sessie" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      focusSession: data,
    },
    { status: 200 }
  );
}
