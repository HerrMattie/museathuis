import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

type ItemUpdate = {
  id: string;
  text_short?: string | null;
  text_long?: string | null;
  audio_url?: string | null;
  tags?: string | null;
};

type Body = {
  tour_id: string;
  items: ItemUpdate[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;

    if (!body || !body.tour_id || !Array.isArray(body.items)) {
      return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
    }

    for (const item of body.items) {
      if (!item.id) continue;
      const { error } = await supabase
        .from("tour_items")
        .update({
          text_short: item.text_short ?? null,
          text_long: item.text_long ?? null,
          audio_url: item.audio_url ?? null,
          tags: item.tags ?? null,
        })
        .eq("id", item.id);

      if (error) {
        console.error("Error updating tour_item", item.id, error);
        return NextResponse.json({ error: "ITEM_UPDATE_FAILED" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unexpected error in POST /api/crm/tours/save-items", e);
    return NextResponse.json({ error: "ITEM_UPDATE_FAILED" }, { status: 500 });
  }
}