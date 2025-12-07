"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type Tour = {
  id: string;
  title: string | null;
  intro_text: string | null;
};

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
  const [tour, setTour] = useState<Tour | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();
        const today = getToday();

        // Dayprogram-slot ophalen
        const { data: rawSlot, error: slotError } = await supabase
          .from("dayprogram_slots")
          .select("slot_index, content_id")
          .eq("day_date", today)
          .eq("content_type", "tour")
          .eq("slot_index", slotIndex)
          .maybeSingle();

        if (slotError) throw slotError;

        const slot = (rawSlot as any) ?? null;

        if (!slot || !slot.content_id) {
          throw new Error("Er is voor vandaag geen tour gekoppeld aan dit slot.");
        }

        const tourId = slot.content_id as string;
        setSlotData({ slotIndex, itemId: tourId });

        // Tour ophalen
        const { data: tourRaw, error: tourError } = await supabase
          .from("tours")
          .select("id, title, intro_text")
          .eq("id", tourId)
          .maybeSingle();

        if (tourError) throw tourError;

        const tourRow = (tourRaw as any) ?? null;

        if (!tourRow) {
          throw new Error("De gekoppelde tour kon niet worden gevonden.");
        }

        const tourData: Tour = {
          id: tourRow.id,
          title: tourRow.title ?? "Tour zonder titel",
          intro_text:
            tourRow.intro_text ??
            "Deze tour is automatisch samengesteld in MuseaThuis.",
        };

        setTour(tourData);

        // Tour-items ophalen
        const { data: itemsRaw, error: itemsError } = await supabase
          .from("tour_items")
          .select("artwork_id, position")
          .eq("tour_id", tourId)
          .order("position", { ascending: true });

        if (itemsError) throw itemsError;

        const items = (itemsRaw as any[]) ?? [];
        const artworkIds = items.map((i) => i.artwork_id as string);

        if (artworkIds.length === 0) {
          setArtworks([]);
          setLoading(false);
          return;
        }

        // Kunstwerken ophalen
        const { data: artworksRaw, error: artworksError } = await supabase
          .from("artworks")
          .select("id, title, artist_name, dating_text, image_url")
          .in("id", artworkIds);

        if (artworksError) throw artworksError;

        const artworksList = ((artworksRaw as any[]) ?? []).map(
          (a): Artwork => ({
            id: a.id,
            title: a.title ?? null,
            artist_name: a.artist_name ?? null,
            dating_text: a.dating_text ?? null,
            image_url: a.image_url ?? null,
          })
        );

        setArtworks(artworksList);
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError(
          e.message ?? "De tour van vandaag kon niet worden geladen."
        );
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

  const firstArtwork = artworks[0] ?? null;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
          TOUR
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Tour: {tour?.title ?? "Tour zonder titel"}
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

      {!loading && !error && tour && (
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 flex items-center justify-center bg-slate-950/60">
              <div className="relative w-full max-w-md aspect-[4/5] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800">
                {firstArtwork?.image_url ? (
                  <Image
                    src={firstArtwork.image_url}
                    alt={firstArtwork.title ?? "Kunstwerk"}
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
                {firstArtwork?.title ?? "Zonder titel"}
              </h2>
              <p className="text-sm text-slate-300">
                {firstArtwork?.artist_name ?? "Onbekende kunstenaar"}
                {firstArtwork?.dating_text
                  ? ` · ${firstArtwork.dating_text}`
                  : ""}
              </p>
              <p className="text-sm text-slate-300">
                {tour.intro_text ??
                  "In een volgende fase komt hier de volledige begeleidende tekst en audio van de tour."}
              </p>
              {artworks.length > 1 && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">
                    Overzicht van werken in deze tour
                  </p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {artworks.map((a, idx) => (
                      <li key={a.id}>
                        {idx + 1}. {a.title ?? "Zonder titel"}{" "}
                        <span className="text-slate-500">
                          {a.artist_name ? `· ${a.artist_name}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
