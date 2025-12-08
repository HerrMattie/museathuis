import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";
import {
  DayprogramSlot,
  DayprogramTodayResponse,
} from "@/lib/dayprogram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
const supabase = supabaseServer();

  try {
    const { data: slots, error } = await supabase
      .from("v_dayprogram_today")
      .select("*")
      .order("slot_key", { ascending: true });

    if (error) {
      console.error("Supabase error in /api/crm/day-program", error.message);
      const resp: DayprogramTodayResponse = {
        status: "error",
        error: error.message,
      };
      return NextResponse.json(resp, { status: 500 });
    }

    const normalizedSlots: DayprogramSlot[] = (slots ?? []).map((row: any) => ({
      id: row.id,
      date: row.date,
      slot_key: row.slot_key,
      content_type: row.content_type,
      content_id: row.content_id,
      is_premium: Boolean(row.is_premium),
      is_free: Boolean(row.is_free),
    }));

    if (!normalizedSlots.length) {
      const resp: DayprogramTodayResponse = {
        status: "empty",
        date: new Date().toISOString().slice(0, 10),
        slots: [],
        meta: {
          total_slots: 0,
          premium_slots: 0,
          free_slots: 0,
        },
      };
      return NextResponse.json(resp);
    }

    const { data: statusData, error: statusError } = await supabase
      .from("v_dayprogram_status_today")
      .select("*")
      .maybeSingle();

    if (statusError) {
      console.error(
        "Supabase error in /api/crm/day-program (status view)",
        statusError.message
      );
    }

    const resp: DayprogramTodayResponse = {
      status: "ok",
      date: normalizedSlots[0].date,
      slots: normalizedSlots,
      meta: {
        total_slots: statusData?.total_slots ?? normalizedSlots.length,
        premium_slots: statusData?.premium_slots ?? 0,
        free_slots: statusData?.free_slots ?? 0,
      },
    };

    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("Unexpected error in /api/crm/day-program", err);
    const resp: DayprogramTodayResponse = {
      status: "error",
      error: err?.message ?? "Unknown error",
    };
    return NextResponse.json(resp, { status: 500 });
  }
}
