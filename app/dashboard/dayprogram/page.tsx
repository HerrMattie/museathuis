
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type SimpleItem = {
  id: string;
  title: string;
};

type DayRow = {
  day_date: string; // YYYY-MM-DD
  tour_id: string | null;
  game_id: string | null;
  focus_id: string | null;
};

type DayRowWithMeta = DayRow & {
  label: string;
};

type LoadingState = "idle" | "loading" | "saving";

export default function DayprogramPage() {
  const [days, setDays] = useState<DayRowWithMeta[]>([]);
  const [tours, setTours] = useState<SimpleItem[]>([]);
  const [games, setGames] = useState<SimpleItem[]>([]);
  const [focusItems, setFocusItems] = useState<SimpleItem[]>([]);
  const [loading, setLoading] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading("loading");
    setError(null);
    setSaveMessage(null);

    try {
      const supabase = supabaseBrowser();

      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 6); // vandaag + 6 dagen
      const end = endDate.toISOString().slice(0, 10);

      const [{ data: scheduleData, error: scheduleError }, { data: tourData, error: tourError }, { data: gameData, error: gameError }, { data: focusData, error: focusError }] =
        await Promise.all([
          supabase
            .from("dayprogram_schedule")
            .select("day_date, tour_id, game_id, focus_id")
            .gte("day_date", start)
            .lte("day_date", end)
            .order("day_date", { ascending: true }),
          supabase.from("tours").select("id, title"),
          supabase.from("games").select("id, title"),
          supabase.from("focus_items").select("id, title"),
        ]);

      if (scheduleError) throw scheduleError;
      if (tourError) throw tourError;
      if (gameError) throw gameError;
      if (focusError) throw focusError;

      const existingByDate = new Map<string, DayRow>();
      (scheduleData ?? []).forEach((row: any) => {
        if (!row.day_date) return;
        existingByDate.set(row.day_date.slice(0, 10), {
          day_date: row.day_date.slice(0, 10),
          tour_id: row.tour_id ?? null,
          game_id: row.game_id ?? null,
          focus_id: row.focus_id ?? null,
        });
      });

      const newDays: DayRowWithMeta[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const iso = d.toISOString().slice(0, 10);

        const label =
          i === 0
            ? "Vandaag"
            : i === 1
            ? "Morgen"
            : d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "short" });

        const existing = existingByDate.get(iso);
        newDays.push({
          day_date: iso,
          tour_id: existing?.tour_id ?? null,
          game_id: existing?.game_id ?? null,
          focus_id: existing?.focus_id ?? null,
          label,
        });
      }

      setDays(newDays);
      setTours((tourData ?? []).map((t: any) => ({ id: t.id, title: t.title ?? "Naamloze tour" })));
      setGames((gameData ?? []).map((g: any) => ({ id: g.id, title: g.title ?? "Naamloos spel" })));
      setFocusItems((focusData ?? []).map((f: any) => ({ id: f.id, title: f.title ?? "Naamloos focusmoment" })));
      setLoading("idle");
    } catch (e: any) {
      console.error("Fout bij laden dagprogramma:", e);
      setError("Er ging iets mis bij het laden van het dagprogramma. Probeer het later opnieuw.");
      setLoading("idle");
    }
  }

  function onFieldChange(index: number, field: keyof DayRow, value: string) {
    setDays((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };
      // lege waarde = null in database
      (row as any)[field] = value || null;
      copy[index] = row;
      return copy;
    });
  }

  async function saveDay(row: DayRowWithMeta) {
    setLoading("saving");
    setError(null);
    setSaveMessage(null);

    try {
      const supabase = supabaseBrowser();

      const { error: upsertError } = await supabase
        .from("dayprogram_schedule")
        .upsert(
          {
            day_date: row.day_date,
            tour_id: row.tour_id,
            game_id: row.game_id,
            focus_id: row.focus_id,
          },
          {
            onConflict: "day_date",
          },
        );

      if (upsertError) throw upsertError;

      setSaveMessage(`Dagprogramma voor ${row.label.toLowerCase()} is opgeslagen.`);
      setLoading("idle");
    } catch (e: any) {
      console.error("Fout bij opslaan dagprogramma:", e);
      setError("Opslaan van deze dag is mislukt. Controleer de velden en probeer het opnieuw.");
      setLoading("idle");
    }
  }

  const isBusy = loading === "loading" || loading === "saving";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
        {/* Zijbalk */}
        <aside className="w-64 shrink-0">
          <div className="mb-6 text-sm font-semibold tracking-wide text-amber-400">
            MUSEATHUIS
          </div>
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            CRM dashboard
          </div>
          <nav className="space-y-1 text-sm">
            <Link
              href="/dashboard"
              className="block rounded-full px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50"
            >
              Overzicht
            </Link>
            <Link
              href="/dashboard/dayprogram"
              className="block rounded-full bg-amber-400 px-4 py-2 font-semibold text-slate-950"
            >
              Dagprogramma
            </Link>
            <Link
              href="/dashboard/crm"
              className="block rounded-full px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50"
            >
              Content &amp; CRM
            </Link>
            <span className="block cursor-default rounded-full px-4 py-2 text-slate-500">
              Analytics (preview)
            </span>
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-900/80 p-4 text-xs text-slate-400">
            <div className="mb-2 font-semibold text-slate-200">Dagprogramma</div>
            <p className="mb-1">
              Stel per dag een tour, spel en focusmoment samen. Dit overzicht is de basis voor de dagtegels op de publiekswebsite.
            </p>
            <p>
              In een volgende fase voegen we ook een kalenderweergave en bulkacties toe.
            </p>
          </div>
        </aside>

        {/* Hoofdcontent */}
        <main className="flex-1">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              Dagprogramma
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Per dag kiest u een hoofd-tour, spel en focusmoment. Hier plant u de komende week vooruit.
            </p>
          </header>

          {(error || saveMessage) && (
            <div className="mb-4 space-y-2">
              {error && (
                <div className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}
              {saveMessage && !error && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
                  {saveMessage}
                </div>
              )}
            </div>
          )}

          <section className="mb-8 rounded-3xl bg-slate-900/70 p-6 shadow-xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Vandaag en komende dagen
                </h2>
                <p className="text-xs text-slate-400">
                  Koppel hier de dagtour, het spel en het focusmoment. Zodra tours, spellen en focusmomenten gepubliceerd zijn, verschijnen ze in de selecties.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void loadAll()}
                  disabled={isBusy}
                  className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                >
                  Opnieuw laden
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Datum</th>
                    <th className="px-2 py-2 w-64">Tour</th>
                    <th className="px-2 py-2 w-64">Spel</th>
                    <th className="px-2 py-2 w-64">Focusmoment</th>
                    <th className="px-2 py-2 text-right">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {days.map((row, index) => (
                    <tr key={row.day_date}>
                      <td className="px-2 py-3 align-top">
                        <div className="text-xs font-semibold text-slate-100">
                          {row.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.day_date}
                        </div>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <select
                          className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-amber-400"
                          value={row.tour_id ?? ""}
                          onChange={(e) => onFieldChange(index, "tour_id", e.target.value)}
                          disabled={isBusy}
                        >
                          <option value="">Geen tour gekozen</option>
                          {tours.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <select
                          className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-amber-400"
                          value={row.game_id ?? ""}
                          onChange={(e) => onFieldChange(index, "game_id", e.target.value)}
                          disabled={isBusy}
                        >
                          <option value="">Geen spel gekozen</option>
                          {games.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <select
                          className="w-full rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-amber-400"
                          value={row.focus_id ?? ""}
                          onChange={(e) => onFieldChange(index, "focus_id", e.target.value)}
                          disabled={isBusy}
                        >
                          <option value="">Geen focusmoment gekozen</option>
                          {focusItems.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.title}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3 align-top text-right">
                        <button
                          type="button"
                          onClick={() => void saveDay(row)}
                          disabled={isBusy}
                          className="rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                        >
                          Dag opslaan
                        </button>
                      </td>
                    </tr>
                  ))}
                  {days.length === 0 && !error && (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-xs text-slate-500">
                        Geen dagen gevonden. Controleer of de tabel <code>dayprogram_schedule</code> aanwezig is in Supabase.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl bg-slate-900/60 p-6 text-xs text-slate-400">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Volgende stappen in het dagprogramma
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Koppeling met echte tours, games en focusmomenten in Supabase verder verfijnen.</li>
              <li>Mogelijkheid om per dag premium- en gratis-slots in te stellen voor tour, spel en focus.</li>
              <li>Kalenderweergave en bulkacties (bijvoorbeeld een maand vooruit vullen).</li>
              <li>Previewpaneel waarin u ziet hoe de dagtegels op de publiekswebsite eruit zien.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
