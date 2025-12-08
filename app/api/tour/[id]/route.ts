
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type TourMeta = {
  id: string;
  title: string;
  subtitle?: string | null;
  intro?: string | null;
  detail_intro?: string | null;
  user_hints?: string | null;
};

type TourItem = {
  id?: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type TourDetailOk = {
  status: "ok";
  meta: TourMeta;
  items: TourItem[];
};

type TourDetailNotFound = {
  status: "not_found";
};

type TourDetailError = {
  status: "error";
  error: string;
};

type TourDetailResponse =
  | TourDetailOk
  | TourDetailNotFound
  | TourDetailError;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseServer();
  const tourId = params.id;

  if (!tourId) {
    const body: TourDetailResponse = {
      status: "error",
      error: "Ongeldige tour referentie.",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const { data: tour, error } = await supabase
    .from("tours")
    .select("id, title, intro, subtitle, overview_intro, detail_intro, user_hints, items")
    .eq("id", tourId)
    .maybeSingle();

  if (error) {
    console.error("tour detail error:", error);
    const body: TourDetailResponse = {
      status: "error",
      error: "De tour kon niet worden geladen.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  if (!tour) {
    const body: TourDetailResponse = {
      status: "not_found",
    };
    return NextResponse.json(body, { status: 404 });
  }

  const items = Array.isArray(tour.items) ? (tour.items as TourItem[]) : [];

  const body: TourDetailResponse = {
    status: "ok",
    meta: {
      id: tour.id,
      title: tour.title,
      subtitle: tour.subtitle ?? null,
      intro: tour.intro ?? null,
      detail_intro: tour.detail_intro ?? null,
      user_hints: tour.user_hints ?? null,
    },
    items,
  };

  return NextResponse.json(body);
}
