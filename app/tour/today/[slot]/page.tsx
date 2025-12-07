"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useItemRating } from "@/lib/useItemRating";
import { RatingStars } from "@/components/RatingStars";

interface SlotData {
  slotIndex: number;
  itemId: string;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<number, string> = {
  1: "Gratis tour",
  2: "Premium tour 1",
  3: "Premium tour 2",
};

export default function TourTodayDetailPage() {
  const params = useParams();
  const slotParam = params?.slot as string | undefined;

  const slotIndex = useMemo(() => {
    const n = Number(slotParam);
    return [1, 2, 3].includes(n) ? (n as 1 | 2 | 3) : 1;
  }, [slotParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [itemTitle, setItemTitle] = useState<string>("Tour zonder titel");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();
        const today = getToday();

        const { data: slot, error: slotError } = await supabase
          .from("dayprogram_slots")
          .select("slot_index, content_id")
          .eq("day_date", today)
          .eq("content_type", "tour")
          .eq("slot_index", slotIndex)
          .maybeSingle();

        if (slotError) throw slotError;
        if (!slot || !slot.content_id) {
          throw new Error("Er is voor vandaag geen tour gekoppeld aan dit slot.");
        }

        const itemId = slot.content_id as string;
        setSlotData({ slotIndex, itemId });

        const { data: tour, error: tourError } = await supabase
          .from("tours")
          .select("id, title")
          .eq("id", itemId)
          .maybeSingle();

        if (tourError) throw tourError;
        if (!tour) {
          throw new Error("De gekoppelde tour kon niet worden gevonden.");
        }

        setItemTitle(
          tour.title && tour.title.trim() !== ""
            ? tour.title
            : "Tour zonder titel"
        );

        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "De tour van vandaag kon niet worden geladen.");
        setLoading(false);
      }
    };

    load();
  }, [slotIndex]);

  const ratingHook = useItemRating({
    tableName: "tour_ratings",
    itemColumn: "tour_id",
    itemId: slotData?.itemId ?? null,
  });

  const headingLabel = SLOT_LABELS[slotIndex];

  const handleRatingChange = async (value: 1 | 2 | 3 | 4 | 5) => {
    const res = await ratingHook.setRating(value);
    if (!res.ok && res.reason === "not-allowed") {
      alert("Maak eerst een gratis profiel aan en log in om te kunnen beoordelen.");
    }
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
          TOUR
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Tour: {itemTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{headingLabel}</p>
          </div>
          <Link
            href="/tour"
            className="inline-flex items-center rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Terug naar tours
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RatingStars
            value={ratingHook.rating}
            onChange={handleRatingChange}
            disabled={!ratingHook.canRate || ratingHook.saving}
          />
          {!ratingHook.canRate && (
            <span className="text-[11px] text-slate-400">
              Maak een gratis profiel aan en log in om tours te beoordelen.
            </span>
          )}
          {ratingHook.error && (
            <span className="text-[11px] text-red-300">
              {ratingHook.error}
            </span>
          )}
        </div>
      </header>

      {loading && (
        <p className="text-sm text-slate-300">
          De tour van vandaag wordt geladen…
        </p>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-50">Rondleiding</h2>
          <p className="text-sm text-slate-300">
            Hier komt de volledige tour: een reeks van ongeveer acht
            kunstwerken met begeleidende teksten en audio. Elk werk krijgt
            dezelfde theaterweergave als bij het focusmoment, inclusief
            mogelijkheid om tussen werken te navigeren.
          </p>
          <p className="text-sm text-slate-300">
            De technische basis voor tours (tours en tour_items) staat al in de
            database. In een volgende stap koppelen we deze pagina aan de
            daadwerkelijke tour_items en tonen we de kunstwerken één voor één.
          </p>
        </section>
      )}
    </div>
  );
}
