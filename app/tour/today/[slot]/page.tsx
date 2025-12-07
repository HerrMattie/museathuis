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

type SlotData = {
  slotIndex: number;
  tourId: string;
};

type TourData = {
  id: string;
  title: string | null;
  intro_text?: string | null;
  intro?: string | null;
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const SLOT_LABELS: Record<number, string> = {
  1: "Gratis dagtour",
  2: "Premium dagtour 1",
  3: "Premium dagtour 2",
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
  const [tour, setTour] = useState<TourData | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = supabaseBrowser();
        const today = getToday();

        // 1. Probeer eerst dayprogram_slots voor vandaag
        const { data: slotRow, error: slotError } = await supabase
          .from("dayprogram_slots")
          .select("slot_index, content_type, content_id")
          .eq("day_date", today)
          .eq("content_type", "tour")
          .eq("slot_index", slotIndex)
          .maybeSingle<any>();

        if (slotError) {
          console.error("Fout bij ophalen dayprogram_slots:", slotError);
        }

        let tourId: string | null = null;

        if (slotRow && slotRow.content_id) {
          tourId = slotRow.content_id as string;
        } else {
          // 2. Fallback: pak laatste tour als er geen dagprogramma-koppeling is
          const { data: fallbackTour, error: fallbackError } = await supabase
            .from("tours")
            .select("id, title, intro_text, intro")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle<any>();

          if (fallbackError) {
            throw fallbackError;
          }

          if (!fallbackTour) {
            throw new Error(
              "Er is nog geen tour beschikbaar voor vandaag. Maak in het dashboard eerst een tour aan."
            );
          }

          tourId = fallbackTour.id as string;

          if (!cancelled) {
            setTour({
              id: fallbackTour.id,
              title: fallbackTour.title ?? "MuseaThuis-tour van vandaag",
              intro_text: fallbackTour.intro_text ?? fallbackTour.intro ?? null,
              intro: fallbackTour.intro ?? null,
            });
          }
        }

        if (!tourId) {
          throw new Error(
            "Er is geen tour gekoppeld aan dit slot en er kon geen fallback-tour worden gevonden."
          );
        }

        if (!cancelled && !tour) {
          // 3. Haal tourdetails op als we ze nog niet hebben
          const { data: tourRow, error: tourError } = await supabase
            .from("tours")
            .select("id, title, intro_text, intro")
            .eq("id", tourId)
            .maybeSingle<any>();

          if (tourError) {
            throw tourError;
          }

          if (!tourRow) {
            throw new Error("De gekoppelde tour kon niet worden gevonden.");
          }

          setTour({
            id: tourRow.id,
            title: tourRow.title ?? "MuseaThuis-tour van vandaag",
            intro_text: tourRow.intro_text ?? tourRow.intro ?? null,
            intro: tourRow.intro ?? null,
          });
        }

        if (!cancelled) {
          setSlotData({ slotIndex, tourId });
        }

        // 4. Haal tour_items met artworks op
        const { data: items, error: itemsError } = await supabase
          .from("tour_items")
          .select(
            "id, position, artwork_id, artworks ( id, title, artist_name, dating_text, image_url )"
          )
          .eq("tour_id", tourId)
          .order("position", { ascending: true });

        if (itemsError) {
          console.error("Fout bij ophalen tour_items:", itemsError);
        }

   
        const mappedArtworks: Artwork[] =
          ((items as any[] | null) ?? [])
            .map((item: any) => {
              const a = item.artworks ?? null;
              if (!a) return null;

              return {
                id: a.id as string,
                title: (a.title ?? null) as string | null,
                artist_name: (a.artist_name ?? null) as string | null,
                dating_text: (a.dating_text ?? null) as string | null,
                image_url: (a.image_url ?? null) as string | null,
              } as Artwork;
            })
            .filter((a): a is Artwork => a !== null);

        setArtworks(mappedArtworks);

        if (!cancelled) {
          setArtworks(mappedArtworks);
          setLoading(false);
        }
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError(
            e?.message ??
              "De tour van vandaag kon niet worden geladen. Controleer of er een tour en tour-items bestaan."
          );
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slotIndex]);

  const ratingHook = useItemRating({
    tableName: "tour_ratings",
    itemColumn: "tour_id",
    itemId: tour?.id ?? null,
  });

  const headingLabel = SLOT_LABELS[slotIndex];

  const handleRatingChange = async (value: 1 | 2 | 3 | 4 | 5) => {
    const res = await ratingHook.setRating(value);
    if (!res.ok && res.reason === "not-allowed") {
      alert("Maak eerst een gratis profiel aan en log in om te kunnen beoordelen.");
    }
  };

  const tourTitle =
    tour?.title && tour.title.trim() !== ""
      ? tour.title
      : "MuseaThuis-tour van vandaag";

  const tourIntro =
    tour?.intro_text && tour.intro_text.trim() !== ""
      ? tour.intro_text
      : "Deze tour wordt automatisch samengesteld op basis van het MuseaThuis-dagprogramma.";

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
          TOUR VAN VANDAAG
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              {tourTitle}
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
            <span className="text-[11px] text-red-300">{ratingHook.error}</span>
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
        <section className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden">
          <div className="p-6 md:p-8 space-y-4">
            <p className="text-sm text-slate-300 max-w-3xl">{tourIntro}</p>

            {artworks.length === 0 && (
              <div className="mt-4 text-sm text-slate-300">
                Er zijn nog geen tour-items gekoppeld aan deze tour. Voeg in het
                dashboard kunstwerken toe aan de tour om ze hier te tonen.
              </div>
            )}

            {artworks.length > 0 && (
              <ol className="mt-4 space-y-4">
                {artworks.map((art, index) => (
                  <li
                    key={art.id}
                    className="flex flex-col md:flex-row gap-4 rounded-2xl bg-slate-950/60 border border-slate-800 p-4"
                  >
                    <div className="w-full md:w-40 md:flex-shrink-0">
                      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                        {art.image_url ? (
                          <Image
                            src={art.image_url}
                            alt={art.title ?? "Kunstwerk"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-500">
                            Geen afbeelding beschikbaar
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        Werk {index + 1}
                      </div>
                      <h2 className="text-sm font-semibold text-slate-50">
                        {art.title ?? "Zonder titel"}
                      </h2>
                      <p className="text-xs text-slate-300">
                        {art.artist_name ?? "Onbekende kunstenaar"}
                        {art.dating_text ? ` · ${art.dating_text}` : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        In een volgende fase komt hier de volledige begeleidende
                        tekst en audio van dit werk binnen de tour.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
