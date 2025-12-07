"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useItemRating } from "@/lib/useItemRating";
import { RatingStars } from "@/components/RatingStars";

type Artwork = {
  id: string;
  title: string | null;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
};

interface SlotData {
  slotIndex: number;
  itemId: string;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<number, string> = {
  1: "Gratis focusmoment",
  2: "Premium focusmoment 1",
  3: "Premium focusmoment 2",
};

export default function FocusTodayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slotParam = params?.slot as string | undefined;

  const slotIndex = useMemo(() => {
    const n = Number(slotParam);
    return [1, 2, 3].includes(n) ? (n as 1 | 2 | 3) : 1;
  }, [slotParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [itemTitle, setItemTitle] = useState<string>("Focusmoment zonder titel");

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
          .eq("content_type", "focus")
          .eq("slot_index", slotIndex)
          .maybeSingle();

        if (slotError) throw slotError;
        if (!slot || !slot.content_id) {
          throw new Error(
            "Er is voor vandaag geen focusmoment gekoppeld aan dit slot."
          );
        }

        const itemId = slot.content_id as string;
        setSlotData({ slotIndex, itemId });

        const { data: focusItem, error: focusError } = await supabase
          .from("focus_items")
          .select("id, title, artwork_id")
          .eq("id", itemId)
          .maybeSingle();

        if (focusError) throw focusError;
        if (!focusItem) {
          throw new Error("Het gekoppelde focusmoment kon niet worden gevonden.");
        }

        setItemTitle(
          focusItem.title && focusItem.title.trim() !== ""
            ? focusItem.title
            : "Focusmoment zonder titel"
        );

        const { data: artwork, error: artworkError } = await supabase
          .from("artworks")
          .select("id, title, artist_name, dating_text, image_url")
          .eq("id", focusItem.artwork_id)
          .maybeSingle();

        if (artworkError) throw artworkError;

        if (artwork) {
          setArtworks([artwork as Artwork]);
        } else {
          setArtworks([]);
        }

        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(
          e.message ??
            "Het focusmoment van vandaag kon niet worden geladen."
        );
        setLoading(false);
      }
    };

    load();
  }, [slotIndex]);

  const ratingHook = useItemRating({
    tableName: "focus_ratings",
    itemColumn: "focus_item_id",
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
          FOCUSMOMENT
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Focus: {itemTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{headingLabel}</p>
          </div>
          <Link
            href="/focus"
            className="inline-flex items-center rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Terug naar focusmomenten
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
              Maak een gratis profiel aan en log in om focusmomenten te beoordelen.
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
          Het focusmoment van vandaag wordt geladen…
        </p>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-950/40 border border-red-800 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          {artworks.length > 0 ? (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-6 flex items-center justify-center bg-slate-950/60">
                <div className="relative w-full max-w-md aspect-[4/5] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800">
                  {artworks[0].image_url ? (
                    <Image
                      src={artworks[0].image_url}
                      alt={artworks[0].title ?? "Kunstwerk"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                      Geen afbeelding beschikbaar
                    </div>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 p-6 md:p-8 space-y-3">
                <h2 className="text-lg font-semibold text-slate-50">
                  {artworks[0].title ?? "Zonder titel"}
                </h2>
                <p className="text-sm text-slate-300">
                  {artworks[0].artist_name ?? "Onbekende kunstenaar"}
                  {artworks[0].dating_text
                    ? ` · ${artworks[0].dating_text}`
                    : ""}
                </p>
                <p className="text-sm text-slate-300">
                  In een volgende fase komt hier de volledige begeleidende tekst
                  van het focusmoment, met audio en zoom-functies voor details.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-300">
              Het gekoppelde kunstwerk kon niet worden geladen.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
