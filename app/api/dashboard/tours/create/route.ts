import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type CreateBody = {
  date: string;
  title: string;
  intro?: string;
  isPremium?: boolean;
  artworkIds: number[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CreateBody | null;

  if (
    !body ||
    typeof body.date !== "string" ||
    typeof body.title !== "string" ||
    !Array.isArray(body.artworkIds) ||
    body.artworkIds.length === 0
  ) {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const isPremium = !!body.isPremium;

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      date: body.date,
      title: body.title,
      intro: body.intro ?? null,
      is_premium: isPremium,
      status: "draft",
    })
    .select("*")
    .single();

  if (tourError || !tour) {
    console.error(tourError);
    return NextResponse.json({ error: "CREATE_TOUR_FAILED" }, { status: 500 });
  }

  const itemsPayload = body.artworkIds.map((artworkId, index) => ({
    tour_id: tour.id,
    artwork_id: artworkId,
    order_index: index,
  }));

  const { error: itemsError } = await supabase
    .from("tour_items")
    .insert(itemsPayload);

  if (itemsError) {
    console.error(itemsError);
    return NextResponse.json({ error: "CREATE_TOUR_ITEMS_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tourId: tour.id });
}