"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type SlotInfo = {
  slotIndex: number;
  contentId: string | null;
  title: string | null;
};

interface DaySlots {
  slots: SlotInfo[];
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<number, string> = {
  1: "Gratis tour",
  2: "Premium tour 1",
  3: "Premium tour 2",
};

export default function TourLandingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DaySlots | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();
        const today = getToday();

        const { data: slots, error: slotsError } = await supabase
          .from("dayprogram_slots")
          .select("slot_index, content_id")
          .eq("day_date", today)
          .eq("content_type", "tour")
          .order("slot_index", { ascending: true });

        if (slotsError) throw slotsError;

        const typedSlots: SlotInfo[] = (slots ?? []).map((row: any) => ({
          slotIndex: row.slot_index as number,
          contentId: row.content_id as string | null,
          title: null,
        }));

        const ids = typedSlots
          .map((s) => s.contentId)
          .filter((v): v is string => !!v);

        if (ids.length > 0) {
          const { data: items, error: itemsError } = await supabase
            .from("tours")
            .select("id, title")
            .in("id", ids);

          if (itemsError) throw itemsError;

          const titleById = new Map<string, string>();
          for (const item of items ?? []) {
            titleById.set(
              item.id,
              item.title && item.title.trim() !== ""
                ? item.title
                : "Tour zonder titel"
            );
          }

          for (const slot of typedSlots) {
            if (slot.contentId && titleById.has(slot.contentId)) {
              slot.title = titleById.get(slot.contentId) ?? null;
            }
          }
        }

        setData({ slots: typedSlots });
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Het dagprogramma kon niet worden geladen.");
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
          TOURS
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Tours van vandaag
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-3xl">
          Elke dag zijn er meerdere rondleidingen langs kunstwerken uit
          verschillende musea. Kies hieronder tussen de gratis tour en twee
          premium tours.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-slate-300">Dagprogramma wordt geladen…</p>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((slotIndex) => {
            const slot = data?.slots.find((s) => s.slotIndex === slotIndex);
            const labelText = SLOT_LABELS[slotIndex];

            if (!slot || !slot.contentId) {
              return (
                <div
                  key={slotIndex}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-200">
                      {labelText}
                    </div>
                    <p className="text-xs text-slate-400">
                      Voor vandaag is er nog geen tour gekoppeld aan dit slot.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={slotIndex}
                href={`/tour/today/${slotIndex}`}
                className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col justify-between hover:border-amber-400/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-slate-200">
                    {labelText}
                  </div>
                  <div className="text-sm font-semibold text-slate-50 line-clamp-2">
                    {slot.title ?? "Tour zonder titel"}
                  </div>
                  <p className="text-xs text-slate-400">
                    Bekijk de tour van vandaag in detail.
                  </p>
                </div>
                <div className="mt-3 text-[11px] text-amber-300">
                  Klik om de tour te openen
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
