"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type LoadState = "idle" | "loading" | "loaded" | "error";

type BestOfRow = {
  id: string;
  title: string;
  avg_rating: number;
  ratings_count: number;
};

type BestOfBucket = {
  label: string;
  tours: BestOfRow[];
  games: BestOfRow[];
  focus: BestOfRow[];
};

export default function BestOfPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState<BestOfBucket | null>(null);
  const [month, setMonth] = useState<BestOfBucket | null>(null);

  useEffect(() => {
    void loadBestOf();
  }, []);

  async function loadBestOf() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();

      const [
        toursWeekRes,
        gamesWeekRes,
        focusWeekRes,
        toursMonthRes,
        gamesMonthRes,
        focusMonthRes,
      ] = await Promise.all([
        supabase
          .from("tour_bestof_week")
          .select("tour_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
        supabase
          .from("game_bestof_week")
          .select("game_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
        supabase
          .from("focus_bestof_week")
          .select("focus_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
        supabase
          .from("tour_bestof_month")
          .select("tour_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
        supabase
          .from("game_bestof_month")
          .select("game_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
        supabase
          .from("focus_bestof_month")
          .select("focus_id, title, avg_rating, ratings_count")
          .order("avg_rating", { ascending: false })
          .order("ratings_count", { ascending: false })
          .limit(5),
      ]);

      if (toursWeekRes.error) throw toursWeekRes.error;
      if (gamesWeekRes.error) throw gamesWeekRes.error;
      if (focusWeekRes.error) throw focusWeekRes.error;
      if (toursMonthRes.error) throw toursMonthRes.error;
      if (gamesMonthRes.error) throw gamesMonthRes.error;
      if (focusMonthRes.error) throw focusMonthRes.error;

      const mapRows = (rows: any[], idKey: string): BestOfRow[] =>
        (rows ?? []).map((r) => ({
          id: String(r[idKey]),
          title: r.title ?? "Zonder titel",
          avg_rating: Number(r.avg_rating ?? 0),
          ratings_count: Number(r.ratings_count ?? 0),
        }));

      setWeek({
        label: "Afgelopen week",
        tours: mapRows(toursWeekRes.data ?? [], "tour_id"),
        games: mapRows(gamesWeekRes.data ?? [], "game_id"),
        focus: mapRows(focusWeekRes.data ?? [], "focus_id"),
      });

      setMonth({
        label: "Afgelopen maand",
        tours: mapRows(toursMonthRes.data ?? [], "tour_id"),
        games: mapRows(gamesMonthRes.data ?? [], "game_id"),
        focus: mapRows(focusMonthRes.data ?? [], "focus_id"),
      });

      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden Best of:", e);
      setError("De Best of-overzichten konden niet worden geladen.");
      setState("error");
    }
  }

  function renderList(title: string, rows: BestOfRow[]) {
    if (!rows.length) {
      return (
        <p className="text-xs text-slate-500">
          Nog geen beoordelingen in deze periode.
        </p>
      );
    }

    return (
      <ul className="mt-2 space-y-1 text-sm">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="flex items-baseline justify-between gap-3 rounded-2xl bg-slate-900/70 px-3 py-2"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-amber-300">
                {index + 1}.
              </span>
              <span className="text-slate-100">{row.title}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              ★ {row.avg_rating.toFixed(2)} · {row.ratings_count} stemmen
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Best of MuseaThuis
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              Hoogst gewaardeerde tours, spellen en focusmomenten
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Op basis van beoordelingen van gebruikers. Dit overzicht vernieuwt automatisch op basis
              van nieuwe waarderingen.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <Link
              href="/"
              className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
            >
              Terug naar vandaag
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Best of-overzichten worden geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van de Best of-overzichten."}
          </div>
        )}

        {state === "loaded" && (
          <div className="space-y-6">
            {week && (
              <section className="rounded-3xl bg-slate-900/80 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {week.label}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Tours (top 5)
                    </h3>
                    {renderList("Tours", week.tours)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Spellen (top 5)
                    </h3>
                    {renderList("Spellen", week.games)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Focusmomenten (top 5)
                    </h3>
                    {renderList("Focusmomenten", week.focus)}
                  </div>
                </div>
              </section>
            )}

            {month && (
              <section className="rounded-3xl bg-slate-900/80 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                  {month.label}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Tours (top 5)
                    </h3>
                    {renderList("Tours", month.tours)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Spellen (top 5)
                    </h3>
                    {renderList("Spellen", month.games)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Focusmomenten (top 5)
                    </h3>
                    {renderList("Focusmomenten", month.focus)}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
