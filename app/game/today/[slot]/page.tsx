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
  1: "Gratis spel",
  2: "Premium spel 1",
  3: "Premium spel 2",
};

export default function GameTodayDetailPage() {
  const params = useParams();
  const slotParam = params?.slot as string | undefined;

  const slotIndex = useMemo(() => {
    const n = Number(slotParam);
    return [1, 2, 3].includes(n) ? (n as 1 | 2 | 3) : 1;
  }, [slotParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [itemTitle, setItemTitle] = useState<string>("Spel zonder titel");

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
          .eq("content_type", "game")
          .eq("slot_index", slotIndex)
          .maybeSingle();

        if (slotError) throw slotError;
        if (!slot || !slot.content_id) {
          throw new Error("Er is voor vandaag geen spel gekoppeld aan dit slot.");
        }

        const itemId = slot.content_id as string;
        setSlotData({ slotIndex, itemId });

        const { data: game, error: gameError } = await supabase
          .from("games")
          .select("id, title")
          .eq("id", itemId)
          .maybeSingle();

        if (gameError) throw gameError;
        if (!game) {
          throw new Error("Het gekoppelde spel kon niet worden gevonden.");
        }

        setItemTitle(
          game.title && game.title.trim() !== ""
            ? game.title
            : "Spel zonder titel"
        );

        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Het spel van vandaag kon niet worden geladen.");
        setLoading(false);
      }
    };

    load();
  }, [slotIndex]);

  const ratingHook = useItemRating({
    tableName: "game_ratings",
    itemColumn: "game_id",
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
          SPEL
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Spel: {itemTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{headingLabel}</p>
          </div>
          <Link
            href="/game"
            className="inline-flex items-center rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Terug naar spellen
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
              Maak een gratis profiel aan en log in om spellen te beoordelen.
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
          Het spel van vandaag wordt geladen…
        </p>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold text-slate-50">
            Interactief spel
          </h2>
          <p className="text-sm text-slate-300">
            Hier komt de interactieve spelervaring: quizvragen, raadspelletjes
            of andere speelse vormen van verdieping rondom kunstwerken.
          </p>
          <p className="text-sm text-slate-300">
            De game-structuur (games en game_items) is al aanwezig. In een
            volgende fase koppelen we deze pagina aan een concreet speltype,
            met score en feedback.
          </p>
        </section>
      )}
    </div>
  );
}
