
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const tourId = params.id;
  if (!tourId) {
    return NextResponse.json(
      { status: "error", error: "Ongeldige tour referentie." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { status: "error", error: "Ongeldig verzoek." },
      { status: 400 }
    );
  }

  const {
    title,
    subtitle,
    overview_intro,
    detail_intro,
    experience_text,
    user_hints,
    closing_text,
  } = body as {
    title?: string;
    subtitle?: string | null;
    overview_intro?: string | null;
    detail_intro?: string | null;
    experience_text?: string | null;
    user_hints?: string | null;
    closing_text?: string | null;
  };

  const supabase = supabaseServer();

  const updatePayload: Record<string, any> = {};
  if (typeof title === "string") updatePayload.title = title;
  if (typeof subtitle === "string" || subtitle === null) updatePayload.subtitle = subtitle;
  if (typeof overview_intro === "string" || overview_intro === null)
    updatePayload.overview_intro = overview_intro;
  if (typeof detail_intro === "string" || detail_intro === null)
    updatePayload.detail_intro = detail_intro;
  if (typeof experience_text === "string" || experience_text === null)
    updatePayload.experience_text = experience_text;
  if (typeof user_hints === "string" || user_hints === null)
    updatePayload.user_hints = user_hints;
  if (typeof closing_text === "string" || closing_text === null)
    updatePayload.closing_text = closing_text;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { status: "error", error: "Geen velden om bij te werken." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("tours")
    .update(updatePayload)
    .eq("id", tourId);

  if (error) {
    console.error("admin update tour error:", error);
    return NextResponse.json(
      { status: "error", error: "Kon de tour niet bijwerken." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" });
}
