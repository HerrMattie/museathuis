import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type ContentType = "tour" | "focus" | "game";
type Strategy = "fill" | "replace";

interface GenerateRequest {
  dayDate: string;
  contentType: ContentType;
  strategy: Strategy;
  slotIndex?: number;
  maxPerType?: number;
}

const TABLES: Record<ContentType, { table: string }> = {
  tour: { table: "tours" },
  focus: { table: "focus_items" },
  game: { table: "games" },
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { dayDate, contentType, strategy, slotIndex, maxPerType = 3 } = body;

    if (!dayDate || !contentType || !strategy) {
      return NextResponse.json(
        { error: "dayDate, contentType en strategy zijn verplicht." },
        { status: 400 }
      );
    }

    if (!["tour", "focus", "game"].includes(contentType)) {
      return NextResponse.json(
        { error: "Ongeldige contentType." },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: slots, error: slotsError } = await (supabase as any)
      .from("dayprogram_slots")
      .select("day_date, content_type, slot_index, content_id, is_premium")
      .eq("day_date", dayDate)
      .eq("content_type", contentType)
      .order("slot_index", { ascending: true });

    if (slotsError) {
      console.error(slotsError);
      return NextResponse.json(
        { error: "Fout bij ophalen dagprogramma.", details: slotsError.message },
        { status: 500 }
      );
    }

    const existing = (slots ?? []) as {
      day_date: string;
      content_type: string;
      slot_index: number;
      content_id: string | null;
      is_premium: boolean | null;
    }[];

    const bannedIds = new Set(
      existing
        .map((s) => s.content_id)
        .filter((id): id is string => !!id)
    );

    const tableInfo = TABLES[contentType as ContentType];

    const { data: candidates, error: candidatesError } = await (supabase as any)
      .from(tableInfo.table)
      .select("id, title")
      .limit(200);

    if (candidatesError) {
      console.error(candidatesError);
      return NextResponse.json(
        {
          error: "Fout bij ophalen beschikbare content.",
          details: candidatesError.message,
        },
        { status: 500 }
      );
    }

    const allCandidates = (candidates ?? []) as { id: string; title?: string | null }[];
    const available = allCandidates.filter((c) => !bannedIds.has(c.id));

    if (available.length === 0) {
      return NextResponse.json(
        { error: "Geen beschikbare content gevonden om in te plannen." },
        { status: 400 }
      );
    }

    const rows: any[] = [];

    if (strategy === "fill") {
      for (let i = 1; i <= maxPerType; i++) {
        const existingSlot = existing.find((s) => s.slot_index === i);
        if (existingSlot && existingSlot.content_id) continue;

        const next = available.shift();
        if (!next) break;

        rows.push({
          day_date: dayDate,
          content_type: contentType,
          slot_index: i,
          content_id: next.id,
          is_premium: i !== 1,
        });
      }
    } else if (strategy === "replace") {
      if (!slotIndex) {
        return NextResponse.json(
          { error: "slotIndex is verplicht bij strategy 'replace'." },
          { status: 400 }
        );
      }

      const next = available[0];
      if (!next) {
        return NextResponse.json(
          { error: "Geen alternatief item beschikbaar om in te plannen." },
          { status: 400 }
        );
      }

      rows.push({
        day_date: dayDate,
        content_type: contentType,
        slot_index: slotIndex,
        content_id: next.id,
        is_premium: slotIndex !== 1,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Geen wijzigingen nodig voor dit dagprogramma." },
        { status: 200 }
      );
    }

    const { data: upserted, error: upsertError } = await (supabase as any)
      .from("dayprogram_slots")
      .upsert(rows, {
        onConflict: "day_date,content_type,slot_index",
      })
      .select("*");

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.json(
        { error: "Fout bij opslaan dagprogramma.", details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        updated: upserted ?? [],
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      {
        error: "Onverwachte fout bij genereren dagprogramma.",
        details: e?.message,
      },
      { status: 500 }
    );
  }
}
