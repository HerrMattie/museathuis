"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type BestItem = {
  id: string;
  title: string | null;
  averageRating: number;
  ratingCount: number;
};

type BestOfSection = {
  tours: BestItem[];
  games: BestItem[];
  focus: BestItem[];
};

function formatRating(r: number): string {
  const rounded = Math.round(r * 10) / 10;
  return rounded.toString().replace(".", ",");
}

export default function BestOfPage() {
  const [weekData, setWeekData] = useState<BestOfSection | null>(null);
  const [monthData, setMonthData] = useState<BestOfSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = supabaseBrowser();

  useEffect(() => {
    async function loadBestOf() {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);

        // Helper: ratings ophalen met fallback als created_at niet bestaat
        async function fetchRatings(
          table: string,
          idColumn: string
        ): Promise<{ all: any[]; week: any[]; month: any[] }> {
          // Proberen met created_at
          const { data, error: err } = await supabase
            .from(table)
            .select(`${idColumn}, rating, created_at`)
            .order("created_at", { ascending: false });

          if (err) {
            // Fallback zonder datums, alles telt dan mee als "all-time"
            const { data: data2, error: err2 } = await supabase
              .from(table)
              .select(`${idColumn}, rating`);
            if (err2 || !data2) {
              return { all: [], week: [], month: [] };
            }
            return { all: data2, week: data2, month: data2 };
          }

          if (!data) return { all: [], week: [], month: [] };

          const weekBoundary = weekAgo.toISOString();
          const monthBoundary = monthAgo.toISOString();

          const week = data.filter(
            (r: any) => r.created_at && r.created_at >= weekBoundary
          );
          const month = data.filter(
            (r: any) => r.created_at && r.created_at >= monthBoundary
          );

          return { all: data, week, month };
        }

        function aggregate(
          rows: any[],
          idColumn: string
        ): { id: string; averageRating: number; ratingCount: number }[] {
          const map = new Map<string, { sum: number; count: number }>();
          for (const row of rows) {
            const id = row[idColumn];
            const rating = row.rating;
            if (!id || rating == null) continue;
            const current = map.get(id) || { sum: 0, count: 0 };
            current.sum += rating;
            current.count += 1;
            map.set(id, current);
          }
          return Array.from(map.entries())
            .map(([id, agg]) => ({
              id,
              averageRating: agg.sum / agg.count,
              ratingCount: agg.count,
            }))
            .sort((a, b) => {
              if (b.averageRating === a.averageRating) {
                return b.ratingCount - a.ratingCount;
              }
              return b.averageRating - a.averageRating;
            })
            .slice(0, 5);
        }

        // Ratings ophalen
        const [tourRatings, gameRatings, focusRatings] = await Promise.all([
          fetchRatings("tour_ratings", "tour_id"),
          fetchRatings("game_ratings", "game_id"),
          fetchRatings("focus_ratings", "focus_id"),
        ]);

        const weekToursAgg = aggregate(tourRatings.week, "tour_id");
        const monthToursAgg = aggregate(tourRatings.month, "tour_id");
        const weekGamesAgg = aggregate(gameRatings.week, "game_id");
        const monthGamesAgg = aggregate(gameRatings.month, "game_id");
        const weekFocusAgg = aggregate(focusRatings.week, "focus_id");
        const monthFocusAgg = aggregate(focusRatings.month, "focus_id");

        // IDs verzamelen voor titelopzoeking
        const weekTourIds = weekToursAgg.map((t) => t.id);
        const monthTourIds = monthToursAgg.map((t) => t.id);
        const weekGameIds = weekGamesAgg.map((g) => g.id);
        const monthGameIds = monthGamesAgg.map((g) => g.id);
        const weekFocusIds = weekFocusAgg.map((f) => f.id);
        const monthFocusIds = monthFocusAgg.map((f) => f.id);

        const uniqueTourIds = Array.from(
          new Set([...weekTourIds, ...monthTourIds])
        );
        const uniqueGameIds = Array.from(
          new Set([...weekGameIds, ...monthGameIds])
        );
        const uniqueFocusIds = Array.from(
          new Set([...weekFocusIds, ...monthFocusIds])
        );

        // Titels ophalen
        async function fetchTitles(
          table: string,
          ids: string[],
          idColumn: string
        ): Promise<Record<string, string | null>> {
          if (!ids.length) return {};
          const { data, error: err } = await supabase
            .from(table)
            .select(`id, title`)
            .in("id", ids);
          if (err || !data) return {};
          const map: Record<string, string | null> = {};
          for (const row of data as any[]) {
            map[row.id] = row.title ?? null;
          }
          return map;
        }

        const [tourTitles, gameTitles, focusTitles] = await Promise.all([
          fetchTitles("tours", uniqueTourIds, "id"),
          fetchTitles("games", uniqueGameIds, "id"),
          fetchTitles("focus_items", uniqueFocusIds, "id"),
        ]);

        function mapAggToItems(
          agg: { id: string; averageRating: number; ratingCount: number }[],
          titles: Record<string, string | null>
        ): BestItem[] {
          return agg.map((a) => ({
            id: a.id,
            title: titles[a.id] ?? "(zonder titel)",
            averageRating: a.averageRating,
            ratingCount: a.ratingCount,
          }));
        }

        setWeekData({
          tours: mapAggToItems(weekToursAgg, tourTitles),
          games: mapAggToItems(weekGamesAgg, gameTitles),
          focus: mapAggToItems(weekFocusAgg, focusTitles),
        });

        setMonthData({
          tours: mapAggToItems(monthToursAgg, tourTitles),
          games: mapAggToItems(monthGamesAgg, gameTitles),
          focus: mapAggToItems(monthFocusAgg, focusTitles),
        });
      } catch (e) {
        console.error(e);
        setError("De toppers van week en maand konden niet worden geladen.");
      } finally {
        setLoading(false);
      }
    }

    loadBestOf();
  }, [supabase]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Overzicht
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Best of MuseaThuis
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Op deze pagina tonen we de best beoordeelde tours, spellen en
          focusmomenten van de afgelopen week en maand. De lijst wordt gevuld op
          basis van gebruikersbeoordelingen; in een latere fase kunnen
          gebruiksdata uit de eventtabellen worden toegevoegd.
        </p>
      </header>

      {loading && (
        <p className="text-xs text-slate-400">Toppers worden geladen…</p>
      )}

      {error && (
        <p className="text-xs text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-base font-semibold text-slate-50">
              Afgelopen week
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <BestOfColumn
                label="Tours"
                items={weekData?.tours ?? []}
                emptyText="Nog geen tours met beoordelingen in de afgelopen week."
              />
              <BestOfColumn
                label="Spellen"
                items={weekData?.games ?? []}
                emptyText="Nog geen spellen met beoordelingen in de afgelopen week."
              />
              <BestOfColumn
                label="Focusmomenten"
                items={weekData?.focus ?? []}
                emptyText="Nog geen focusmomenten met beoordelingen in de afgelopen week."
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-base font-semibold text-slate-50">
              Afgelopen maand
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <BestOfColumn
                label="Tours"
                items={monthData?.tours ?? []}
                emptyText="Nog geen tours met beoordelingen in de afgelopen maand."
              />
              <BestOfColumn
                label="Spellen"
                items={monthData?.games ?? []}
                emptyText="Nog geen spellen met beoordelingen in de afgelopen maand."
              />
              <BestOfColumn
                label="Focusmomenten"
                items={monthData?.focus ?? []}
                emptyText="Nog geen focusmomenten met beoordelingen in de afgelopen maand."
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function BestOfColumn({
  label,
  items,
  emptyText,
}: {
  label: string;
  items: BestItem[];
  emptyText: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      {items.length === 0 && (
        <p className="text-[11px] text-slate-400">
          {emptyText}
        </p>
      )}
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-slate-400">
                #{index + 1}
              </span>
              <p className="text-xs font-medium text-slate-50">
                {item.title || "(zonder titel)"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-[11px] text-slate-400">
              <span>{formatRating(item.averageRating)} / 5</span>
              <span>{item.ratingCount}x beoordeeld</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
