"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import clsx from "clsx";

type ContentType = "tour" | "focus" | "game";

type DaySummary = {
  date: string;
  tours: number;
  focus: number;
  games: number;
};

type SlotRow = {
  day_date: string;
  content_type: ContentType;
  slot_index: number;
  content_id: string | null;
  content_title: string | null;
  is_premium: boolean | null;
};

const CONTENT_LABELS: Record<ContentType, string> = {
  tour: "Tours",
  focus: "Focusmomenten",
  game: "Spellen",
};

const SLOT_LABELS: Record<ContentType, string[]> = {
  tour: ["Dagelijkse tour", "Premium tour 1", "Premium tour 2"],
  focus: ["Gratis focusmoment", "Premium focusmoment 1", "Premium focusmoment 2"],
  game: ["Gratis spel", "Premium spel 1", "Premium spel 2"],
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getMonthBounds(date: Date): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(end) };
}

function buildCalendarDays(date: Date): string[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // maandag=0
  const daysInMonth = lastOfMonth.getDate();

  const days: string[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    days.push("");
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function DayprogramDashboardPage() {
  const [monthRef, setMonthRef] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const [summaries, setSummaries] = useState<Record<string, DaySummary>>({});
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calendarDays = useMemo(() => buildCalendarDays(monthRef), [monthRef]);
  const monthBounds = useMemo(() => getMonthBounds(monthRef), [monthRef]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        setError(null);
        const supabase = supabaseBrowser();

        const { data, error } = await (supabase as any)
          .from("dayprogram_slots")
          .select("day_date, content_type, content_id")
          .gte("day_date", monthBounds.start)
          .lte("day_date", monthBounds.end);

        if (error) throw error;

        const byDate: Record<string, DaySummary> = {};

        (data ?? []).forEach((row: any) => {
          const date = row.day_date as string;
          if (!byDate[date]) {
            byDate[date] = {
              date,
              tours: 0,
              focus: 0,
              games: 0,
            };
          }
          if (row.content_type === "tour") byDate[date].tours++;
          if (row.content_type === "focus") byDate[date].focus++;
          if (row.content_type === "game") byDate[date].games++;
        });

        setSummaries(byDate);
        setLoadingSummary(false);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message ?? "Het dagprogramma-overzicht kon niet worden geladen."
        );
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [monthBounds.start, monthBounds.end]);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        setError(null);
        const supabase = supabaseBrowser();

        const { data, error } = await (supabase as any)
          .from("dayprogram_overview")
          .select(
            "day_date, content_type, slot_index, content_id, content_title, is_premium"
          )
          .eq("day_date", selectedDate)
          .order("content_type", { ascending: true })
          .order("slot_index", { ascending: true });

        if (error) throw error;

        setSlots((data ?? []) as SlotRow[]);
        setLoadingDetail(false);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message ?? "Het dagprogramma voor de geselecteerde dag kon niet worden geladen."
        );
        setLoadingDetail(false);
      }
    };

    if (selectedDate) {
      loadDetail();
    }
  }, [selectedDate]);

  const handleGenerate = async (contentType: ContentType, strategy: "fill" | "replace", slotIndex?: number) => {
    try {
      setLoadingDetail(true);
      setError(null);

      const res = await fetch("/api/dayprogram/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayDate: selectedDate,
          contentType,
          strategy,
          slotIndex: slotIndex ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? "Fout bij genereren dagprogramma.");
      }

      const supabase = supabaseBrowser();

      const { data, error } = await (supabase as any)
        .from("dayprogram_overview")
        .select(
          "day_date, content_type, slot_index, content_id, content_title, is_premium"
        )
        .eq("day_date", selectedDate)
        .order("content_type", { ascending: true })
        .order("slot_index", { ascending: true });

      if (error) throw error;
      setSlots((data ?? []) as SlotRow[]);

      const { data: sumData, error: sumError } = await (supabase as any)
        .from("dayprogram_slots")
        .select("day_date, content_type, content_id")
        .gte("day_date", monthBounds.start)
        .lte("day_date", monthBounds.end);

      if (!sumError && sumData) {
        const byDate: Record<string, DaySummary> = {};
        (sumData as any[]).forEach((row: any) => {
          const date = row.day_date as string;
          if (!byDate[date]) {
            byDate[date] = {
              date,
              tours: 0,
              focus: 0,
              games: 0,
            };
          }
          if (row.content_type === "tour") byDate[date].tours++;
          if (row.content_type === "focus") byDate[date].focus++;
          if (row.content_type === "game") byDate[date].games++;
        });
        setSummaries(byDate);
      }

      setLoadingDetail(false);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message ??
          "Er ging iets mis bij het genereren van een voorstel voor het dagprogramma."
      );
      setLoadingDetail(false);
    }
  };

  const monthLabel = useMemo(
    () =>
      format(monthRef, "MMMM yyyy", {
        locale: nl,
      }),
    [monthRef]
  );

  const selectedSummary = summaries[selectedDate];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
            CRM · DAGPROGRAMMA
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mt-1">
            Dagprogramma en contentplanning
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overzicht van tours, focusmomenten en spellen per dag. Kies een dag en genereer
            een voorstel of alternatief.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] gap-6">
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">Kalenderoverzicht</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setMonthRef(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                className="h-7 w-7 rounded-full border border-slate-700 text-slate-200 text-xs flex items-center justify-center hover:bg-slate-800"
              >
                ‹
              </button>
              <div className="text-xs font-medium text-slate-200">{monthLabel}</div>
              <button
                type="button"
                onClick={() =>
                  setMonthRef(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                className="h-7 w-7 rounded-full border border-slate-700 text-slate-200 text-xs flex items-center justify-center hover:bg-slate-800"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-500 mb-1">
            <div>Ma</div>
            <div>Di</div>
            <div>Wo</div>
            <div>Do</div>
            <div>Vr</div>
            <div>Za</div>
            <div>Zo</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={idx} className="h-10" />;
              }
              const dayNr = Number(date.slice(8, 10));
              const summary = summaries[date];
              const isToday = date === todayISO();
              const isSelected = date === selectedDate;

              const filledTypes =
                (summary?.tours ? 1 : 0) +
                (summary?.focus ? 1 : 0) +
                (summary?.games ? 1 : 0);

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "h-10 rounded-xl border text-left px-1.5 py-1 transition-colors",
                    isSelected
                      ? "border-amber-400 bg-amber-500/10 text-amber-100"
                      : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-600",
                    isToday && !isSelected && "ring-1 ring-amber-400/60"
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold">{dayNr}</span>
                    {filledTypes > 0 && (
                      <span className="text-[9px] text-slate-400">
                        {filledTypes}/3 types
                      </span>
                    )}
                  </div>
                  {summary && (
                    <div className="mt-0.5 flex gap-0.5">
                      {summary.tours > 0 && (
                        <span className="inline-flex rounded-full bg-blue-500/20 text-[8px] px-1">
                          T{summary.tours}
                        </span>
                      )}
                      {summary.focus > 0 && (
                        <span className="inline-flex rounded-full bg-emerald-500/20 text-[8px] px-1">
                          F{summary.focus}
                        </span>
                      )}
                      {summary.games > 0 && (
                        <span className="inline-flex rounded-full bg-purple-500/20 text-[8px] px-1">
                          S{summary.games}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedSummary && (
            <div className="mt-3 rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-[11px] text-slate-300">
              <div className="font-medium text-slate-100 mb-1">
                Samenvatting {selectedDate}
              </div>
              <div className="flex flex-wrap gap-2">
                <span>Tours: {selectedSummary.tours}/3</span>
                <span>Focusmomenten: {selectedSummary.focus}/3</span>
                <span>Spellen: {selectedSummary.games}/3</span>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4 md:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Dagprogramma voor {selectedDate}
              </h2>
              <p className="text-[11px] text-slate-400">
                Genereer per type een voorstel of vervang één slot door een alternatief.
              </p>
            </div>
          </div>

          {loadingDetail && (
            <p className="text-xs text-slate-400">Dagprogramma wordt geladen…</p>
          )}

          {!loadingDetail &&
            (["tour", "focus", "game"] as ContentType[]).map((type) => {
              const typeSlots = slots.filter((s) => s.content_type === type);
              const byIndex: Record<number, SlotRow | undefined> = {};
              typeSlots.forEach((s) => {
                byIndex[s.slot_index] = s;
              });

              return (
                <div
                  key={type}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-100">
                        {CONTENT_LABELS[type]}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Vul lege slots automatisch of vraag een alternatief voor een bestaande
                        selectie.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerate(type, "fill")}
                      className="inline-flex items-center rounded-full border border-amber-500/70 px-3 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/10"
                    >
                      Genereer voorstel
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {[1, 2, 3].map((slotIndex) => {
                      const slot = byIndex[slotIndex];
                      const label = SLOT_LABELS[type][slotIndex - 1];

                      return (
                        <div
                          key={slotIndex}
                          className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-200">
                                Slot {slotIndex}
                              </span>
                              {slotIndex !== 1 && (
                                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-medium text-amber-200">
                                  Premium
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {label}
                            </p>
                            <p className="text-[11px] text-slate-200 truncate">
                              {slot?.content_title ??
                                (slot?.content_id
                                  ? "Gekoppeld item zonder titel"
                                  : "Nog geen item gekoppeld")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleGenerate(type, "replace", slotIndex)}
                              className="inline-flex items-center rounded-full border border-slate-700 px-2.5 py-0.5 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
                            >
                              Genereer alternatief
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </section>
      </div>
    </div>
  );
}
