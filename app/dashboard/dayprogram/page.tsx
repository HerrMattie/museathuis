"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type ContentType = "tour" | "game" | "focus";

interface SelectOption {
  id: string;
  title: string;
}

interface SlotState {
  slotIndex: number;
  contentId: string | null;
}

interface DayState {
  date: string; // YYYY-MM-DD
  label: string; // bijv. "VR 05-12"
  slots: {
    tour: SlotState[];
    game: SlotState[];
    focus: SlotState[];
  };
  saving: boolean;
  dirty: boolean;
}

const SLOT_INDICES = [1, 2, 3];

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function DayprogramPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [days, setDays] = useState<DayState[]>([]);
  const [tourOptions, setTourOptions] = useState<SelectOption[]>([]);
  const [gameOptions, setGameOptions] = useState<SelectOption[]>([]);
  const [focusOptions, setFocusOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();

        // 1. Bepaal bereik: vandaag + 6 dagen
        const today = new Date();
        const dateRange: { date: Date; dateStr: string; label: string }[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          dateRange.push({
            date: d,
            dateStr: toDateString(d),
            label: formatDateLabel(d).toUpperCase(),
          });
        }
        const startDate = dateRange[0].dateStr;
        const endDate = dateRange[dateRange.length - 1].dateStr;

        // 2. Haal contentopties op (tours, games, focus)
        const [toursRes, gamesRes, focusRes, slotsRes] = await Promise.all([
          supabase
            .from("tours")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("games")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("focus_items")
            .select("id, title")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("dayprogram_slots")
            .select("*")
            .gte("day_date", startDate)
            .lte("day_date", endDate),
        ]);

        if (toursRes.error) throw toursRes.error;
        if (gamesRes.error) throw gamesRes.error;
        if (focusRes.error) throw focusRes.error;
        if (slotsRes.error) throw slotsRes.error;

        const tours: SelectOption[] =
          (toursRes.data ?? []).map((t: any) => ({
            id: t.id,
            title: t.title && t.title.trim() !== "" ? t.title : "Tour zonder titel",
          })) ?? [];

        const games: SelectOption[] =
          (gamesRes.data ?? []).map((g: any) => ({
            id: g.id,
            title: g.title && g.title.trim() !== "" ? g.title : "Spel zonder titel",
          })) ?? [];

        const focus: SelectOption[] =
          (focusRes.data ?? []).map((f: any) => ({
            id: f.id,
            title: f.title && f.title.trim() !== "" ? f.title : "Focusmoment zonder titel",
          })) ?? [];

        setTourOptions(tours);
        setGameOptions(games);
        setFocusOptions(focus);

        // 3. Sloten per dag vullen
        const slots = slotsRes.data ?? [];

        const initialDays: DayState[] = dateRange.map((d) => ({
          date: d.dateStr,
          label: d.label,
          slots: {
            tour: SLOT_INDICES.map((i) => ({ slotIndex: i, contentId: null })),
            game: SLOT_INDICES.map((i) => ({ slotIndex: i, contentId: null })),
            focus: SLOT_INDICES.map((i) => ({ slotIndex: i, contentId: null })),
          },
          saving: false,
          dirty: false,
        }));

        for (const row of slots) {
          const dateStr: string = row.day_date;
          const contentType: ContentType = row.content_type;
          const slotIndex: number = row.slot_index;
          const contentId: string = row.content_id;

          const day = initialDays.find((d) => d.date === dateStr);
          if (!day) continue;

          if (!SLOT_INDICES.includes(slotIndex)) continue;

          const slotArray = day.slots[contentType];
          const idx = slotArray.findIndex((s) => s.slotIndex === slotIndex);
          if (idx !== -1) {
            slotArray[idx].contentId = contentId;
          }
        }

        setDays(initialDays);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Er ging iets mis bij het laden van het dagprogramma.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getOptions = (contentType: ContentType): SelectOption[] => {
    if (contentType === "tour") return tourOptions;
    if (contentType === "game") return gameOptions;
    return focusOptions;
  };

  const handleSelectChange = (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number,
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.date !== dayDate) return day;
        const slots = { ...day.slots };
        const arr = [...slots[contentType]];
        const idx = arr.findIndex((s) => s.slotIndex === slotIndex);
        if (idx !== -1) {
          arr[idx] = {
            ...arr[idx],
            contentId: value === "" ? null : value,
          };
        }
        slots[contentType] = arr as any;
        return {
          ...day,
          slots,
          dirty: true,
        };
      })
    );
  };

  const handleGenerate = (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number
  ) => {
    const opts = getOptions(contentType);
    if (!opts.length) {
      alert("Er is nog geen inhoud beschikbaar om te koppelen.");
      return;
    }
    const random = opts[Math.floor(Math.random() * opts.length)];
    handleSelectChange(dayDate, contentType, slotIndex, random.id);
  };

  const handleClear = (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number
  ) => {
    handleSelectChange(dayDate, contentType, slotIndex, "");
  };

  const handleSaveDay = async (dayDate: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.date === dayDate ? { ...d, saving: true, dirty: false } : d
      )
    );
    try {
      const supabase = supabaseBrowser();
      const day = days.find((d) => d.date === dayDate);
      if (!day) return;

      for (const contentType of ["tour", "game", "focus"] as ContentType[]) {
        const slotArray = day.slots[contentType];

        const { error: delError } = await supabase
          .from("dayprogram_slots")
          .delete()
          .eq("day_date", dayDate)
          .eq("content_type", contentType);
        if (delError) throw delError;

        const rowsToInsert = slotArray
          .filter((s) => s.contentId)
          .map((s) => ({
            day_date: dayDate,
            content_type: contentType,
            slot_index: s.slotIndex,
            content_id: s.contentId,
            is_premium: s.slotIndex > 1,
            status: "published",
          }));

        if (rowsToInsert.length > 0) {
          const { error: insError } = await supabase
            .from("dayprogram_slots")
            .insert(rowsToInsert);
          if (insError) throw insError;
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Opslaan van het dagprogramma is mislukt.");
      setDays((prev) =>
        prev.map((d) =>
          d.date === dayDate ? { ...d, dirty: true, saving: false } : d
        )
      );
      return;
    }

    setDays((prev) =>
      prev.map((d) =>
        d.date === dayDate ? { ...d, saving: false, dirty: false } : d
      )
    );
  };

  if (loading) {
    return (
      <div className="px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-50 mb-4">
          Dagprogramma
        </h1>
        <p className="text-slate-300 text-sm">Dagprogramma wordt geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-50 mb-4">
          Dagprogramma
        </h1>
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <p className="text-slate-300 text-sm">
          Vernieuw de pagina of controleer de databaseverbinding in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">
          Dagprogramma
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Stel per dag samen welke tour, welk spel en welk focusmoment beschikbaar zijn. 
          Per type kunt u maximaal drie slots gebruiken: één gratis (slot 1) en twee premiumsloten (slot 2 en 3).
        </p>
      </header>

      <div className="grid gap-6">
        {days.map((day) => (
          <section
            key={day.date}
            className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
                  Dagprogramma
                </div>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold text-slate-50">
                    {day.label}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {day.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {day.dirty && (
                  <span className="text-amber-300">Niet opgeslagen</span>
                )}
                <button
                  onClick={() => handleSaveDay(day.date)}
                  disabled={day.saving}
                  className="inline-flex items-center rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60 disabled:hover:bg-amber-400"
                >
                  {day.saving ? "Opslaan..." : "Dag opslaan"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DayProgramColumn
                title="Tour"
                description="Kies tot drie tours: één gratis en twee premium."
                day={day}
                contentType="tour"
                options={tourOptions}
                onSelectChange={handleSelectChange}
                onGenerate={handleGenerate}
                onClear={handleClear}
              />
              <DayProgramColumn
                title="Spel"
                description="Kies tot drie spellen. Spellen zijn optioneel."
                day={day}
                contentType="game"
                options={gameOptions}
                onSelectChange={handleSelectChange}
                onGenerate={handleGenerate}
                onClear={handleClear}
              />
              <DayProgramColumn
                title="Focusmoment"
                description="Kies tot drie focusmomenten per dag."
                day={day}
                contentType="focus"
                options={focusOptions}
                onSelectChange={handleSelectChange}
                onGenerate={handleGenerate}
                onClear={handleClear}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  description: string;
  day: DayState;
  contentType: ContentType;
  options: SelectOption[];
  onSelectChange: (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number,
    value: string
  ) => void;
  onGenerate: (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number
  ) => void;
  onClear: (
    dayDate: string,
    contentType: ContentType,
    slotIndex: number
  ) => void;
}

function DayProgramColumn(props: ColumnProps) {
  const {
    title,
    description,
    day,
    contentType,
    options,
    onSelectChange,
    onGenerate,
    onClear,
  } = props;

  const labelForSlot = (slotIndex: number) => {
    if (slotIndex === 1) return "Gratis slot";
    return `Premium slot ${slotIndex - 1}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>

      <div className="space-y-3">
        {SLOT_INDICES.map((slotIndex) => {
          const slotArray = day.slots[contentType];
          const slot = slotArray.find((s) => s.slotIndex === slotIndex);
          const value = slot?.contentId ?? "";

          return (
            <div
              key={slotIndex}
              className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {labelForSlot(slotIndex)}
                </span>
                {slotIndex === 1 ? (
                  <span className="text-[10px] text-emerald-300 bg-emerald-900/40 rounded-full px-2 py-0.5">
                    Gratis
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 bg-amber-900/40 rounded-full px-2 py-0.5">
                    Premium
                  </span>
                )}
              </div>

              <select
                value={value}
                onChange={(e) =>
                  onSelectChange(day.date, contentType, slotIndex, e.target.value)
                }
                className="w-full rounded-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              >
                <option value="">Geen inhoud gekoppeld</option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onGenerate(day.date, contentType, slotIndex)}
                  className="inline-flex items-center rounded-full border border-amber-400/70 px-3 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-400/10"
                >
                  Genereer voorstel
                </button>
                {value && (
                  <button
                    type="button"
                    onClick={() => onClear(day.date, contentType, slotIndex)}
                    className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
