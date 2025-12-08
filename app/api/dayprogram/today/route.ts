
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

type DayprogramSlot = {
  slot_date: string | null;
  slot_key: string | null;
  content_type: string;
  content_id: string;
  is_premium: boolean | null;
};

type DayprogramTodayOk = {
  status: "ok";
  date: string;
  slots: DayprogramSlot[];
};

type DayprogramTodayEmpty = {
  status: "empty";
  date: string;
  slots: DayprogramSlot[];
};

type DayprogramTodayError = {
  status: "error";
  error: string;
};

type DayprogramTodayResponse =
  | DayprogramTodayOk
  | DayprogramTodayEmpty
  | DayprogramTodayError;

export async function GET() {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const { data, error } = await supabase
    .from("dayprogram_slots")
    .select("slot_date, slot_key, content_type, content_id, is_premium")
    .eq("slot_date", today)
    .order("slot_key", { ascending: true });

  if (error) {
    console.error("dayprogram/today error:", error);
    const body: DayprogramTodayResponse = {
      status: "error",
      error: "Kon het dagprogramma voor vandaag niet laden.",
    };
    return NextResponse.json(body, { status: 500 });
  }

  const slots = (data ?? []) as DayprogramSlot[];

  if (!slots.length) {
    const body: DayprogramTodayResponse = {
      status: "empty",
      date: today,
      slots: [],
    };
    return NextResponse.json(body);
  }

  const body: DayprogramTodayResponse = {
    status: "ok",
    date: today,
    slots,
  };

  return NextResponse.json(body);
}
