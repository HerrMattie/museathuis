import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

// Simpele placeholder-API: maakt een concept tour aan.
// Later koppel je hier de echte AI-tourgeneratie aan.
export async function POST() {
  const supabase = supabaseServer() as any;

  const { data, error } = await supabase
    .from("tours")
    .insert(
      {
        title: "Placeholder tour",
        intro: "TODO: implement tour generation",
        status: "draft",
        is_premium: false,
      } as any
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error creating tour", error);
    return NextResponse.json(
      { error: "Fout bij aanmaken van tour" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      tour: data,
    },
    { status: 200 }
  );
}
