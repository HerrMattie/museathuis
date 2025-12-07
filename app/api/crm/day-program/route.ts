import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");

  let targetDate: string;
  if (dateParam) {
    const d = new Date(dateParam);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "INVALID_DATE" },
        { status: 400 }
      );
    }
    targetDate = toDateOnly(d);
  } else {
    const now = new Date();
    targetDate = toDateOnly(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
  }

  const [{ data: tour }, { data: game }, { data: focus }] = await Promise.all([
    supabase
      .from("tours")
      .select("id, date, title, status, is_premium")
      .eq("date", targetDate)
      .maybeSingle(),
    supabase
      .from("games")
      .select("id, date, title, status, is_premium")
      .eq("date", targetDate)
      .maybeSingle(),
    supabase
      .from("focus_schedule")
      .select("id, date, status, focus_item_id")
      .eq("date", targetDate)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    date: targetDate,
    tour,
    game,
    focus,
  });
}