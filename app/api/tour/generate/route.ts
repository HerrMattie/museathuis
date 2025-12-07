import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("tours")
    .insert({
      title: "Placeholder tour",
      intro: "Deze tour is een placeholder die aangeeft dat de tour-engine is aangesloten.",
      status: "draft",
      is_premium: false
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tour: data });
}
