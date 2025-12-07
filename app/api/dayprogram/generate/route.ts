// app/api/dayprogram/generate/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseClient";

type ContentType = "tour" | "focus" | "game";
type Mode = "proposal" | "alternative";

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

async function parseRequest(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    return {
      dayDate: body?.dayDate as string | undefined,
      contentType: body?.contentType as ContentType | undefined,
      mode: (body?.mode as Mode | undefined) ?? "proposal",
      userId: body?.userId as string | undefined,
    };
  }

  const form = await req.formData();
  return {
    dayDate: (form.get("dayDate") as string) ?? undefined,
    contentType: (form.get("contentType") as ContentType) ?? undefined,
    mode: ((form.get("mode") as Mode) ?? "proposal") as Mode,
    userId: (form.get("userId") as string) ?? undefined,
  };
}

export async function POST(req: Request) {
  const { dayDate, contentType, mode, userId } = await parseRequest(req);

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

  // 2. Bestaande slots voor logging
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

  // 3. Nieuwe rows voorbereiden
  const rows: any[] = [1, 2, 3].map((slotIndex) => ({
    day_date: dayDate,
    content_type: contentType,
    slot_index: slotIndex,
    content_id: selected[slotIndex - 1],
    is_premium: slotIndex > 1,
  }));

  // 4. Upsert met expliciete any-cast ivm Supabase types
  const upsertRes = await supabase
    .from("dayprogram_slots")
    .upsert(rows as any, {
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

  // 5. Logging in dayprogram_events
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
    .insert(eventsPayload as any);

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
