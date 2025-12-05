import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

type Body = {
  tour_id: string;
  artwork_id: string;
  order_index: number;
};

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;

    if (!body || !body.tour_id || !body.artwork_id || typeof body.order_index !== "number") {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    const payload = {
      tour_id: body.tour_id,
      artwork_id: body.artwork_id,
      order_index: body.order_index,
      user_id: DEMO_USER_ID,
    };

    const { error } = await supabase.from("tour_content_events").insert(payload);

    if (error) {
      console.error("Error inserting tour_content_event", error);
      // Niet kritisch voor de gebruiker: geen fout terug naar UI
    }

    // Optioneel ook generieke content_events proberen, maar fouten negeren
    try {
      await supabase.from("content_events").insert({
        route: "/tour/today",
        content_type: "tour_artwork",
        tour_id: body.tour_id,
        artwork_id: body.artwork_id,
        position: body.order_index,
        occurred_at: new Date().toISOString(),
      } as any);
    } catch (e) {
      console.error("Optional insert into content_events failed", e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected error in POST /api/track/tour-artwork", e);
    return NextResponse.json({ error: "TRACKING_FAILED" }, { status: 500 });
  }
}