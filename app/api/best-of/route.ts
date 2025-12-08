import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";
import type { BestofPeriod, BestofItem, BestofResponse } from "@/lib/bestof";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = supabaseServer();
  const { searchParams } = new URL(request.url);

  const period = (searchParams.get("period") as BestofPeriod) || "week";
  const viewName =
    period === "month" ? "v_bestof_month" : "v_bestof_week";

  try {
    const { data, error } = await supabase
      .from(viewName)
      .select("*");

    if (error) {
      console.error("Supabase error in /api/best-of", error.message);
      const resp: BestofResponse = {
        status: "error",
        error: error.message,
      };
      return NextResponse.json(resp, { status: 500 });
    }

    if (!data || data.length === 0) {
      const resp: BestofResponse = {
        status: "empty",
        period,
        items: [],
      };
      return NextResponse.json(resp);
    }

    const rows = data as any[];

    const items: BestofItem[] = rows.map((row) => ({
      content_type: row.content_type,
      content_id: String(row.content_id),
      avg_rating: Number(row.avg_rating),
      rating_count: Number(row.rating_count),
    }));

    // Groepeer per content_type om metadata op te halen
    const byType: Record<string, string[]> = {};
    for (const item of items) {
      if (!byType[item.content_type]) byType[item.content_type] = [];
      byType[item.content_type].push(item.content_id);
    }

    // Helper om in batches metadata op te halen
    async function attachMetadata() {
      const promises: Promise<void>[] = [];

      if (byType["tour"]?.length) {
        const ids = byType["tour"];
        promises.push(
          (async () => {
            const { data: tours, error } = await supabase
              .from("tours")
              .select("id, title, subtitle, image_url")
              .in("id", ids);
            if (error) {
              console.error("Error fetching tours for best-of", error.message);
              return;
            }
            const map = new Map(
              (tours ?? []).map((t: any) => [String(t.id), t])
            );
            items.forEach((item) => {
              if (item.content_type === "tour") {
                const t = map.get(item.content_id);
                if (t) {
                  item.title = t.title;
                  item.subtitle = t.subtitle;
                  item.image_url = t.image_url;
                }
              }
            });
          })()
        );
      }

      if (byType["game"]?.length) {
        const ids = byType["game"];
        promises.push(
          (async () => {
            const { data: games, error } = await supabase
              .from("games")
              .select("id, title, subtitle, image_url")
              .in("id", ids);
            if (error) {
              console.error("Error fetching games for best-of", error.message);
              return;
            }
            const map = new Map(
              (games ?? []).map((g: any) => [String(g.id), g])
            );
            items.forEach((item) => {
              if (item.content_type === "game") {
                const g = map.get(item.content_id);
                if (g) {
                  item.title = g.title;
                  item.subtitle = g.subtitle;
                  item.image_url = g.image_url;
                }
              }
            });
          })()
        );
      }

      if (byType["focus"]?.length) {
        const ids = byType["focus"];
        promises.push(
          (async () => {
            const { data: focuses, error } = await supabase
              .from("focus_moments")
              .select("id, title, subtitle, image_url")
              .in("id", ids);
            if (error) {
              console.error(
                "Error fetching focus_moments for best-of",
                error.message
              );
              return;
            }
            const map = new Map(
              (focuses ?? []).map((f: any) => [String(f.id), f])
            );
            items.forEach((item) => {
              if (item.content_type === "focus") {
                const f = map.get(item.content_id);
                if (f) {
                  item.title = f.title;
                  item.subtitle = f.subtitle;
                  item.image_url = f.image_url;
                }
              }
            });
          })()
        );
      }

      await Promise.all(promises);
    }

    await attachMetadata();

    const resp: BestofResponse = {
      status: "ok",
      period,
      items,
    };

    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("Unexpected error in /api/best-of", err);
    const resp: BestofResponse = {
      status: "error",
      error: err?.message ?? "Unknown error",
    };
    return NextResponse.json(resp, { status: 500 });
  }
}