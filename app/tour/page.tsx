"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

type TourSummary = {
  id: string;
  title: string | null;
  intro_text: string | null;
};

type SlotWithTour = {
  slotIndex: number;
  isPremium: boolean;
  tour: TourSummary | null;
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<number, string> = {
  1: "Gratis dagtour",
  2: "Premium dagtour 1",
  3: "Premium dagtour 2",
};

export default function ToursPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotWithTour[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();
        const today = getToday();

        // 1. Haal de dagprogramma-slots voor tours op
        const { data: slotRowsRaw, error: slotError } = await supabase
          .from("dayprogram_slots")
          .select("slot_index, is_premium, content_id")
          .eq("day_date", today)
          .eq("content_type", "tour")
          .order("slot_index", { ascending: true });

        if (slotError) {
          throw slotError;
        }

        const slotRows = (slotRowsRaw ?? []) as any[];

        const tourIds = slotRows
          .map((s) => s.content_id as string | null)
          .filter((id): id is string => !!id);

        let toursById: Record<string, TourSummary> = {};

        if (tourIds.length > 0) {
          const { data: tourRowsRaw, error: toursError } = await supabase
            .from("tours")
            .select("id, title, intro_text")
            .in("id", tourIds);

          if (toursError) {
            throw toursError;
          }

          const tourRows = (tourRowsRaw ?? []) as any[];
          toursById = tourRows.reduce((acc, row) => {
            acc[row.id as string] = {
              id: row.id as string,
              title: row.title ?? null,
              intro_text: row.intro_text ?? null,
            };
            return acc;
          }, {} as Record<string, TourSummary>);
        }

        const mappedSlots: SlotWithTour[] = [1, 2, 3].map((slotIndex) => {
          const row = slotRows.find((r) => r.slot_index === slotIndex);
          const isPremium =
            row?.is_premium !== undefined
              ? Boolean(row.is_premium)
              : slotIndex > 1;

          const tourId = row?.content_id as string | undefined;
          const tour = tourId ? toursById[tourId] ?? null : null;

          return {
            slotIndex,
            isPremium,
            tour,
          };
        });

        if (!cancelled) {
          setSlots(mappedSlots);
          setLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError(
            e?.message ??
              "De tours van vandaag konden niet worden geladen. Controleer of er dagprogramma-slots en tours bestaan."
          );
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasAnyTour = slots.some((s) => s.tour !== null);

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
          TOURS
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Tours
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          Tours zijn verhalende routes langs ongeveer acht kunstwerken, bedoeld
          voor een sessie van twintig tot dertig minuten met een doorlopende
          lijn.
        </p>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          Hier kun je later een kalender met komende tours, filters en koppeling
          met Best of tonen. Voor nu zie je hieronder de dagtours van vandaag.
        </div>
      </header>

      {loading && (
        <p className="text-sm text-slate-300">De tours van vandaag worden geladen…</p>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-4">
          {!hasAnyTour && (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
              Er is nog geen tour gekoppeld aan het dagprogramma van vandaag.
              Maak in het dashboard een tour aan en koppel deze aan een slot.
            </div>
          )}

          {hasAnyTour && (
            <div className="grid gap-4 md:grid-cols-3">
              {slots.map((slot) => {
                const label = SLOT_LABELS[slot.slotIndex];
                const tourTitle =
                  slot.tour?.title && slot.tour.title.trim() !== ""
                    ? slot.tour.title
                    : "Nog geen tour gekoppeld";
                const intro =
                  slot.tour?.intro_text && slot.tour.intro_text.trim() !== ""
                    ? slot.tour.intro_text
                    : "Koppel via het dashboard een tour aan dit slot om hier de beschrijving te tonen.";

                const hasTour = slot.tour !== null;

                return (
                  <div
                    key={slot.slotIndex}
                    className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                        <span>Slot {slot.slotIndex}</span>
                        <span>{label}</span>
                      </div>
                      <h2 className="text-sm font-semibold text-slate-50">
                        {tourTitle}
                      </h2>
                      <p className="text-xs text-slate-300 line-clamp-3">
                        {intro}
                      </p>
                    </div>

                    <div className="mt-4">
                      {hasTour ? (
                        <Link
                          href={`/tour/today/${slot.slotIndex}`}
                          className="inline-flex items-center justify-center rounded-full border border-amber-400 px-3 py-1.5 text-[11px] font-medium text-amber-300 hover:bg-amber-400/10"
                        >
                          Bekijk tour van vandaag
                        </Link>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-slate-600 px-3 py-1.5 text-[11px] font-medium text-slate-400">
                          Nog geen tour gekoppeld
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
