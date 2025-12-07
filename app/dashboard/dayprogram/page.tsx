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

  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // maandag = 0
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

  // Overzicht hele maand ophalen
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

  // Detail voor geselecteerde dag
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
          e?.message ??
            "Het dagprogramma voor de geselecteerde dag kon niet worden geladen."
        );
        setLoadingDetail(false);
      }
    };

    if (selectedDate) {
      loadDetail();
    }
  }, [selectedDate]);

  const handleGenerate = async (
    contentType: ContentType,
    strategy: "fill" | "replace",
    slotIndex?: number
  ) => {
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

      // Detail opnieuw laden
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

      // Samenvatting opnieuw laden
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
            Overzicht van tours, focusmomenten en spellen per dag. Kies een dag en
            genereer een voorstel of alternatief.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] gap-6">
        {/* Kalender links */}
        <section className="rounded-3 ​:contentReference[oaicite:0]{index=0}​
