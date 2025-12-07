import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ContentType = "tour" | "focus" | "game";
type Mode = "proposal" | "alternative";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables ontbreken voor dayprogram generate API"
    );
  }

  return createClient(url, key);
}

function getTableName(contentType: ContentType): string {
  if (contentType === "tour") return "tours";
  if (contentType === "focus") return "focus_items";
  return "games";
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Ongeldige JSON payload" },
      { status: 400 }
    );
  }

  const dayDate: string | undefined = body?.dayDate;
  const contentType: ContentType | undefined = body?.contentType;
  const mode: Mode = body?.mode === "alternative" ? "alternative" : "proposal";
  const userId: string | undefined = body?.userId; // optioneel, kan later via auth helpers

  if (!dayDate || !contentType) {
    return NextResponse.json(
      { error: "dayDate en contentType zijn verplicht" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();
  const tableName = getTableName(contentType);

  // 1. Haal kandidaten op
  const candidatesRes = await supabase.from(tableName).select("id").limit(100);

  if (candidatesRes.error) {
    console.error("Error fetching candidates", candidatesRes.error);
    return NextResponse.json(
      { error: "Fout bij ophalen van content kandidaten" },
      { status: 500 }
    );
  }

  const candidateIds = (candidatesRes.data ?? [])
    .map((row: any) => row.id)
    .filter((id: any) => id != null);

  if (candidateIds.length < 3) {
    return NextResponse.json(
      {
        error:
          "Er zijn minder dan 3 beschikbare items voor dit type. Voeg meer content toe.",
      },
      { status: 400 }
    );
  }

  const shuffled = shuffle(candidateIds);
  const selected = shuffled.slice(0, 3);

  // 2. Haal bestaande slots op voor logging
  const existingRes = await supabase
    .from("dayprogram_slots")
    .select("slot_index, content_id")
    .eq("day_date", dayDate)
    .eq("content_type", contentType);

  if (existingRes.error) {
    console.error("Error fetching existing dayprogram_slots", existingRes.error);
  }

  const existingBySlot: Record<number, string | null> = {};
  (existingRes.data ?? []).forEach((row: any) => {
    existingBySlot[row.slot_index] = row.content_id;
  });

  const rows = [1, 2, 3].map((slotIndex) => ({
    day_date: dayDate,
    content_type: contentType,
    slot_index: slotIndex,
    content_id: selected[slotIndex - 1],
    is_premium: slotIndex > 1,
  }));

  const upsertRes = await supabase
    .from("dayprogram_slots")
    .upsert(rows, {
      onConflict: "day_date,content_type,slot_index",
    })
    .select("*");

  if (upsertRes.error) {
    console.error("Error upserting dayprogram_slots", upsertRes.error);
    return NextResponse.json(
      { error: "Fout bij opslaan van dagprogramma" },
      { status: 500 }
    );
  }

  // 3. Log wijzigingen in dayprogram_events
  const eventsPayload = rows.map((row) => ({
    day_date: row.day_date,
    content_type: row.content_type,
    slot_index: row.slot_index,
    old_content_id: existingBySlot[row.slot_index] ?? null,
    new_content_id: row.content_id,
    user_id: userId ?? null,
    action: mode === "alternative" ? "generate_alternative" : "generate_proposal",
    metadata: {},
  }));

  const logRes = await supabase
    .from("dayprogram_events")
    .insert(eventsPayload);

  if (logRes.error) {
    console.error("Error logging dayprogram_events", logRes.error);
  }

  return NextResponse.json(
    {
      ok: true,
      mode,
      dayDate,
      contentType,
      slots: upsertRes.data,
    },
    { status: 200 }
  );
}