"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type SimpleItem = {
  id: string;
  title: string;
};

type DayConfig = {
  tour_id: string | null;
  game_id: string | null;
  focus_id: string | null;
};

type LoadState = "idle" | "loading" | "loaded" | "error";

type DayInfo = {
  label: string;
  iso: string;
};

function getNextDays(count: number): DayInfo[] {
  const result: DayInfo[] = [];
  const formatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    result.push({
      iso,
      label: formatter.format(d),
    });
  }

  return result;
}

export default function DayprogramPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [tours, setTours] = useState<SimpleItem[]>([]);
  const [games, setGames] = useState<SimpleItem[]>([]);
  const [focusItems, setFocusItems] = useState<SimpleItem[]>([]);

  const [schedule, setSchedule] = useState<Record<string, DayConfig>>({});
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [savedIndicator, setSavedIndicator] = useState<Record<string, "idle" | "saved" | "error">>({});

  const days = getNextDays(7);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const dayStart = days[0].iso;
      const dayEnd = days[days.length - 1].iso;

      const [toursRes, gamesRes, focusRes, scheduleRes] = await Promise.all([
        supabase.from("tours").select("id, title").order("created_at", { ascending: false }),
        supabase.from("games").select("id, title").order("created_at", { ascending: false }),
        supabase.from("focus_items").select("id, title").order("created_at", { ascending: false }),
        supabase
          .from("dayprogram_schedule")
          .select("day_date, tour_id, game_id, focus_id")
          .gte("day_date", dayStart)
          .lte("day_date", dayEnd),
      ]);

      if (toursRes.error) throw toursRes.error;
      if (gamesRes.error) throw gamesRes.error;
      if (focusRes.error) throw focusRes.error;
      if (scheduleRes.error) throw scheduleRes.error;

      setTours(
        (toursRes.data ?? []).map((t: any) => ({
          id: String(t.id),
          title: t.title ?? "Naamloze tour",
        }))
      );

      setGames(
        (gamesRes.data ?? []).map((g: any) => ({
          id: String(g.id),
          title: g.title ?? "Naamloos spel",
        }))
      );

      setFocusItems(
        (focusRes.data ?? []).map((f: any) => ({
          id: String(f.id),
          title: f.title ?? "Naamloos focusmoment",
        }))
      );

      const initialSchedule: Record<string, DayConfig> = {};
      for (const day of days) {
        initialSchedule[day.iso] = {
          tour_id: null,
          game_id: null,
          focus_id: null,
        };
      }

      (scheduleRes.data ?? []).forEach((row: any) => {
        const key = row.day_date;
        if (!initialSchedule[key]) {
          initialSchedule[key] = {
            tour_id: null,
            game_id: null,
            focus_id: null,
          };
        }
        initialSchedule[key] = {
          tour_id: row.tour_id ? String(row.tour_id) : null,
          game_id: row.game_id ? String(row.game_id) : null,
          focus_id: row.focus_id ? String(row.focus_id) : null,
        };
      });

      setSchedule(initialSchedule);
      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden dagprogramma:", e);
      setError("Het dagprogramma kon niet worden geladen.");
      setState("error");
    }
  }

  function updateDay(dayKey: string, partial: Partial<DayConfig>) {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        tour_id: prev[dayKey]?.tour_id ?? null,
        game_id: prev[dayKey]?.game_id ?? null,
        focus_id: prev[dayKey]?.focus_id ?? null,
        ...partial,
      },
    }));
    setSavedIndicator((prev) => ({
      ...prev,
      [dayKey]: "idle",
    }));
  }

  async function handleSaveDay(dayKey: string) {
    const cfg = schedule[dayKey] ?? { tour_id: null, game_id: null, focus_id: null };

    setSavingDay(dayKey);
    setError(null);
    setSavedIndicator((prev) => ({ ...prev, [dayKey]: "idle" }));

    try {
      const supabase = supabaseBrowser();

      const { error: upsertError } = await supabase
        .from("dayprogram_schedule")
        .upsert(
          {
            day_date: dayKey,
            tour_id: cfg.tour_id || null,
            game_id: cfg.game_id || null,
            focus_id: cfg.focus_id || null,
          },
          { onConflict: "day_date" }
        );

      if (upsertError) {
        console.error("Dagprogramma upsert error:", upsertError);
        throw upsertError;
      }

      setSavedIndicator((prev) => ({ ...prev, [dayKey]: "saved" }));
    } catch (e: any) {
      console.error("Fout bij opslaan dagprogramma:", e);
      setError("Er ging iets mis bij het opslaan van een dag in het dagprogramma.");
      setSavedIndicator((prev) => ({ ...prev, [dayKey]: "error" }));
    } finally {
      setSavingDay(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              Dagprogramma
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Stel per dag samen welke tour, welk spel en welk focusmoment zichtbaar zijn op de
              voorpagina. Spellen zijn optioneel; u kunt ook alleen een tour en focusmoment plannen.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
            >
              Terug naar dashboard
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-6 text-sm text-slate-300">
            Dagprogramma wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-6 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van het dagprogramma."}
          </div>
        )}

        {state === "loaded" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => {
              const cfg = schedule[day.iso] ?? { tour_id: null, game_id: null, focus_id: null };
              const isSaving = savingDay === day.iso;
              const indicator = savedIndicator[day.iso] ?? "idle";

              return (
                <div
                  key={day.iso}
                  className="flex flex-col rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                      {day.label}
                    </div>
                    <div className="text-[11px] text-slate-500">{day.iso}</div>
                  </div>

                  <label className="mt-2 block text-[11px] font-medium text-slate-400">
                    Tour
                    <select
                      className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-1.5 text-xs text-slate-100"
                      value={cfg.tour_id ?? ""}
                      onChange={(e) =>
                        updateDay(day.iso, {
                          tour_id: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Geen tour</option>
                      {tours.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-3 block text-[11px] font-medium text-slate-400">
                    Spel (optioneel)
                    <select
                      className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-1.5 text-xs text-slate-100"
                      value={cfg.game_id ?? ""}
                      onChange={(e) =>
                        updateDay(day.iso, {
                          game_id: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Geen spel</option>
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-3 block text-[11px] font-medium text-slate-400">
                    Focusmoment
                    <select
                      className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-2 py-1.5 text-xs text-slate-100"
                      value={cfg.focus_id ?? ""}
                      onChange={(e) =>
                        updateDay(day.iso, {
                          focus_id: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Geen focusmoment</option>
                      {focusItems.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => void handleSaveDay(day.iso)}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center rounded-full border border-amber-400 bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60"
                    >
                      {isSaving ? "Opslaan…" : "Dag opslaan"}
                    </button>
                    {indicator === "saved" && (
                      <span className="text-[11px] text-emerald-300">Opgeslagen</span>
                    )}
                    {indicator === "error" && (
                      <span className="text-[11px] text-red-300">Niet opgeslagen</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
