import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const supabase = supabaseServer();

  const updatePayload = {
    title: body.title ?? null,
    date: body.date ?? null,
    intro: body.intro ?? null,
    theme: body.theme ?? null,
    subtitle: body.subtitle ?? null,
    short_description: body.short_description ?? null,
    duration_min:
      body.duration_min === null || body.duration_min === ""
        ? null
        : Number(body.duration_min),
    is_premium: !!body.is_premium,
    status: body.status ?? "draft",
    overview_intro: body.overview_intro ?? null,
    detail_intro: body.detail_intro ?? null,
    user_hints: body.user_hints ?? null,
    experience_text: body.experience_text ?? null,
    closing_text: body.closing_text ?? null,
  };

  const { data, error } = await supabase
    .from("tours")
    .update(updatePayload)
    .eq("id", params.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Tour update error", error);
    return NextResponse.json(
      { error: error?.message ?? "Kon tour niet opslaan." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
