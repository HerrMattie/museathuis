import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET() {
  const { data, error } = await supabase
    .from("v_best_of_museathuis")
    .select("*");

  if (error || !data) {
    console.error("Error loading best-of data", error);
    return NextResponse.json(
      { error: "BEST_OF_ERROR" },
      { status: 500 }
    );
  }

  const today = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const last7 = new Date(today.getTime() - 7 * dayMs);
  const last30 = new Date(today.getTime() - 30 * dayMs);

  const parsed = data.map((row: any) => ({
    content_type: row.content_type as string,
    content_id: row.content_id as string,
    date: row.date as string,
    title: row.title as string,
    avg_rating: Number(row.avg_rating) || 0,
    ratings_count: Number(row.ratings_count) || 0,
  }));

  const inRange = (from: Date) =>
    parsed.filter((item) => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d >= from && d <= today && item.ratings_count > 0;
    });

  const sortFn = (a: any, b: any) => {
    if (b.avg_rating !== a.avg_rating) {
      return b.avg_rating - a.avg_rating;
    }
    return b.ratings_count - a.ratings_count;
  };

  const bestWeek = inRange(last7).sort(sortFn).slice(0, 10);
  const bestMonth = inRange(last30).sort(sortFn).slice(0, 10);

  return NextResponse.json({ bestWeek, bestMonth });
}