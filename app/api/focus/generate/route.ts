import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({
      title: "Placeholder focus",
      description: "Deze focus-sessie is een placeholder voor de focus-engine.",
      status: "draft",
      is_premium: false
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, focus: data });
}
