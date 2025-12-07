import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

function getWeekStart(d = new Date()): string {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function getMonthStart(d = new Date()): string {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  first.setHours(0, 0, 0, 0);
  return first.toISOString().slice(0, 10);
}

export async function POST() {
  const supabase = supabaseServer();
  const today = new Date();
  const weekStart = getWeekStart(today);
  const monthStart = getMonthStart(today);

  async function pickBestForPeriod(
    periodType: "week" | "month",
    periodStart: string,
    contentType: "tour" | "game" | "focus"
  ) {
    const table =
      contentType === "tour"
        ? "tours"
        : contentType === "game"
        ? "games"
        : "focus_sessions";

    const { data: items, error: itemsError } = await supabase
      .from(table)
      .select("id, date_planned")
      .gte("date_planned", periodStart)
      .lte("date_planned", today.toISOString().slice(0, 10))
      .eq("is_published", true);

    if (itemsError || !items || items.length === 0) {
      return null;
    }

    const ids = (items as any[]).map((i) => i.id as string);

    const { data: ratings } = await supabase
      .from("content_ratings")
      .select("content_id, rating")
      .eq("content_type", contentType)
      .in("content_id", ids);

    let progressTable: string | null = null;
    if (contentType === "tour") progressTable = "tour_progress";
    if (contentType === "game") progressTable = "game_results";
    if (contentType === "focus") progressTable = "focus_progress";

    let completions: any[] = [];
    if (progressTable) {
      const { data: prog } = await supabase
        .from(progressTable)
        .select(
          "id, user_id, completed_at, tour_id, game_id, focus_id, score"
        );
      completions = prog ?? [];
    }

    const scores = new Map<
      string,
      { avgRating: number; ratingCount: number; completionCount: number }
    >();

    for (const id of ids) {
      scores.set(id, { avgRating: 0, ratingCount: 0, completionCount: 0 });
    }

    if (ratings) {
      for (const r of ratings as any[]) {
        const s = scores.get(r.content_id);
        if (!s) continue;
        s.ratingCount += 1;
        s.avgRating =
          (s.avgRating * (s.ratingCount - 1) + r.rating) / s.ratingCount;
      }
    }

    if (completions && progressTable) {
      for (const c of completions as any[]) {
        const contentId =
          contentType === "tour"
            ? c.tour_id
            : contentType === "game"
            ? c.game_id
            : c.focus_id;
        if (!contentId) continue;
        const s = scores.get(contentId);
        if (!s) continue;
        s.completionCount += 1;
      }
    }

    let bestId: string | null = null;
    let bestScore = -1;

    for (const id of ids) {
      const s = scores.get(id);
      if (!s) continue;
      const ratingComponent = s.ratingCount > 0 ? s.avgRating : 0;
      const completionComponent = Math.log(1 + s.completionCount);
      const totalScore = ratingComponent + completionComponent;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestId = id;
      }
    }

    if (!bestId) return null;

    const highlightPayload: any = {
      period_type: periodType,
      period_start: periodStart,
      item_type: contentType,
      tour_id: null,
      game_id: null,
      focus_id: null,
    };

    if (contentType === "tour") highlightPayload.tour_id = bestId;
    if (contentType === "game") highlightPayload.game_id = bestId;
    if (contentType === "focus") highlightPayload.focus_id = bestId;

    const { error: upsertError } = await supabase
      .from("highlights")
      .upsert(highlightPayload, {
        onConflict: "period_type,period_start,item_type",
      });

    if (upsertError) {
      console.error(upsertError);
      return null;
    }

    return { periodType, contentType, bestId, score: bestScore };
  }

  const results: any[] = [];

  for (const type of ["tour", "game", "focus"] as const) {
    const rWeek = await pickBestForPeriod("week", weekStart, type);
    if (rWeek) results.push(rWeek);
  }

  for (const type of ["tour", "game", "focus"] as const) {
    const rMonth = await pickBestForPeriod("month", monthStart, type);
    if (rMonth) results.push(rMonth);
  }

  return NextResponse.json({ ok: true, results });
}
