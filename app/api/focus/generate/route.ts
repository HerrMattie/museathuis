import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  // TypeScript-types omzeilen, functioneel hetzelfde
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
    );

    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, focus: data });
}
