import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DayprogramStatusResponse =
  | {
      status: "ok";
      date: string;
      total_slots: number;
      premium_slots: number;
      free_slots: number;
    }
  | {
      status: "empty";
      date: string;
      total_slots: 0;
      premium_slots: 0;
      free_slots: 0;
    }
  | {
      status: "error";
      error: string;
    };

export async function GET() {
const supabase = supabaseServer();

  try {
    const { data, error } = await supabase
      .from("v_dayprogram_status_today")
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "Supabase error in /api/crm/day-program/status",
        error.message
      );
      const resp: DayprogramStatusResponse = {
        status: "error",
        error: error.message,
      };
      return NextResponse.json(resp, { status: 500 });
    }

    if (!data) {
      const resp: DayprogramStatusResponse = {
        status: "empty",
        date: new Date().toISOString().slice(0, 10),
        total_slots: 0,
        premium_slots: 0,
        free_slots: 0,
      };
      return NextResponse.json(resp);
    }

    const resp: DayprogramStatusResponse = {
      status: "ok",
      date: data.date ?? new Date().toISOString().slice(0, 10),
      total_slots: data.total_slots ?? 0,
      premium_slots: data.premium_slots ?? 0,
      free_slots: data.free_slots ?? 0,
    };

    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("Unexpected error in /api/crm/day-program/status", err);
    const resp: DayprogramStatusResponse = {
      status: "error",
      error: err?.message ?? "Unknown error",
    };
    return NextResponse.json(resp, { status: 500 });
  }
}
