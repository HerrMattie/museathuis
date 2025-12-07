"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { RatingStars } from "@/components/RatingStars";

type LoadState = "idle" | "loading" | "loaded" | "empty" | "error";

type Slot = {
  id: string;
  slotIndex: number;
  isPremium: boolean;
  contentId: string;
};

type TourMeta = {
  id: string;
  title: string;
  intro: string | null;
  theme: string | null;
  level: string | null;
};

type TourArtwork = {
  id: string;
  title: string;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
  description: string | null;
};

export default function TourTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [meta, setMeta] = useState<TourMeta | null>(null);
  const [items, setItems] = useState<TourArtwork[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [ownRating, setOwnRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    void loadTodaySlots();
  }, []);

  useEffect(() => {
    if (!meta) return;
    void loadUserAndRating(meta.id);
  }, [meta?.id]);

  async function loadTodaySlots() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      const { data, error: slotsError } = await supabase
        .from("dayprogram_slots")
        .select("id, slot_index, is_premium, content_id")
        .eq("day_date", today)
        .eq("content_type", "tour")
        .order("slot_index", { ascending: true });

      if (slotsError) {
        console.error("Fout dayprogram_slots (tour):", slotsError);
        throw slotsError;
      }

      const rows = (data ?? []).filter((row: any) => row.content_id);
      if (rows.length === 0) {
        setState("empty");
        return;
      }

      const mapped: Slot[] = rows.map((row: any) => ({
        id: String(row.id),
        slotIndex: row.slot_index,
        isPremium: !!row.is_premium,
        contentId: String(row.content_id),
      }));

      setSlots(mapped);
      const first = mapped[0];
      setSelectedSlotIndex(first.slotIndex);
      await loadTourById(first.contentId);
    } catch (e: any) {
      console.error("Fout bij laden tourslots:", e);
      setError("De tour van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadTourById(tourId: string) {
    setState("loading");
    setError(null);
    setItems([]);

    try {
      const supabase = supabaseBrowser();

      const { data: tourRows, error: tourError } = await supabase
        .from("tours")
        .select("*")
        .eq("id", tourId)
        .limit(1);

      if (tourError) {
        console.error("Fout tours:", tourError);
        throw tourError;
      }

      const tour = tourRows && tourRows.length > 0 ? (tourRows[0] as any) : null;
      if (!tour) {
        setState("empty");
        return;
      }

      const tourMeta: TourMeta = {
        id: String(tour.id),
        title: tour.title || tour.name || "Dagelijkse tour",
        intro: tour.intro_text || tour.description || null,
        theme: tour.theme || tour.topic || null,
        level: tour.level || null,
      };
      setMeta(tourMeta);

      const { data: itemRows, error: itemsError } = await supabase
        .from("tour_items")
        .select("*")
        .eq("tour_id", tourId)
        .order("position", { ascending: true });

      if (itemsError) {
        console.error("Fout tour_items:", itemsError);
        throw itemsError;
      }

      const artworkIds = Array.from(
        new Set(
          (itemRows ?? [])
            .map((row: any) => row.artwork_id)
            .filter((id: any) => !!id)
        )
      );

      let artworksById: Record<string, any> = {};
      if (artworkIds.length > 0) {
        const { data: artworkRows, error: artworksError } = await supabase
          .from("artworks")
          .select("*")
          .in("id", artworkIds);

        if (artworksError) {
          console.error("Fout artworks:", artworksError);
          throw artworksError;
        }

        artworksById = Object.fromEntries(
          (artworkRows ?? []).map((row: any) => [String(row.id), row])
        );
      }

      const mappedItems: TourArtwork[] = (itemRows ?? []).map((item: any, index: number) => {
        const art = artworksById[String(item.artwork_id)] ?? null;
        return {
          id: art ? String(art.id) : `placeholder-${index}`,
          title: art?.title || item.title || `Kunstwerk ${index + 1}`,
          artist_name: art?.artist_name || null,
          dating_text: art?.dating_text || null,
          image_url: art?.image_url || null,
          description: item.text || art?.description_primary || null,
        };
      });

      setItems(mappedItems);
      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden tour:", e);
      setError("De tour van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadUserAndRating(tourId: string) {
    try {
      setRatingLoading(true);
      setRatingError(null);

      const supabase = supabaseBrowser();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userResult?.user ?? null;
      if (!user) {
        setUserId(null);
        setOwnRating(null);
        setRatingLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: ratingRows, error: ratingFetchError } = await supabase
        .from("tour_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("tour_id", tourId)
        .limit(1);

      if (ratingFetchError) throw ratingFetchError;

      const row = ratingRows && ratingRows.length > 0 ? ratingRows[0] : null;
      setOwnRating(row ? (row as any).rating : null);
      setRatingLoading(false);
    } catch (e: any) {
      console.error("Fout bij laden beoordeling tour:", e);
      setRatingError("Uw beoordeling kon niet worden geladen.");
      setRatingLoading(false);
    }
  }

  async function handleRatingChange(value: number) {
    if (!meta) return;

    try {
      setRatingLoading(true);
      setRatingError(null);

      const supabase = supabaseBrowser();
      const { data: userResult, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      const user = userResult?.user ?? null;

      if (!user) {
        window.location.href = "/auth/login?redirect=/tour";
        return;
      }

      const { error: upsertError } = await supabase.from("tour_ratings").upsert({
        user_id: user.id,
        tour_id: meta.id,
        rating: value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      setUserId(user.id);
      setOwnRating(value);
    } catch (e: any) {
      console.error("Fout bij opslaan beoordeling tour:", e);
      setRatingError("Uw beoordeling kon niet worden opgeslagen.");
    } finally {
      setRatingLoading(false);
    }
  }

  function renderSlotsSwitcher() {
    if (slots.length <= 1) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {slots.map((slot) => {
          const isActive = slot.slotIndex === selectedSlotIndex;
          const label =
            slot.slotIndex === 1
              ? "Gratis tour van vandaag"
              : `Premium tour ${slot.slotIndex - 1}`;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotIndex(slot.slotIndex);
                void loadTourById(slot.contentId);
              }}
              className={[
                "rounded-full border px-3 py-1.5",
                isActive
                  ? "border-amber-400 bg-amber-400/10 text-amber-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Tour
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Dagelijkse tour"}
            </h1>
            {meta?.theme && (
              <p className="mt-1 text-xs text-slate-400">
                Thema van deze tour: {meta.theme}
              </p>
            )}

            {state === "loaded" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingStars
                  value={ownRating}
                  onChange={(value) => void handleRatingChange(value)}
                  disabled={ratingLoading}
                  label="Uw beoordeling"
                />
                {!userId && !ratingLoading && (
                  <span className="text-[11px] text-slate-500">
                    Maak een gratis profiel aan om tours te beoordelen.
                  </span>
                )}
                {ratingError && (
                  <span className="text-[11px] text-red-300">
                    {ratingError}
                  </span>
                )}
              </div>
            )}

            {renderSlotsSwitcher()}
          </div>
          <div className="text-xs text-slate-400">
            <Link
              href="/"
              className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
            >
              Terug naar vandaag
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            De tour van vandaag wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van de tour."}
          </div>
        )}

        {state === "empty" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Er is voor vandaag nog geen tour ingepland in het dagprogramma. Voeg in het CRM een tour
            toe aan <code>dayprogram_slots</code> (type <code>tour</code>) om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && (
          <>
            {meta?.intro && (
              <div className="mb-6 rounded-3xl bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
                <p className="whitespace-pre-line">{meta.intro}</p>
              </div>
            )}

            {items.length === 0 && (
              <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
                Deze tour heeft nog geen werken gekoppeld. Voeg in het CRM tour-items toe om de tour
                te vullen.
              </div>
            )}

            {items.length > 0 && (
              <ol className="space-y-6">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-3xl bg-slate-900/80 p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                        Kunstwerk {index + 1} van {items.length}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
                      {item.image_url ? (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950/60">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-950/40 text-xs text-slate-500">
                          Geen afbeelding beschikbaar
                        </div>
                      )}

                      <div className="space-y-2 text-sm leading-relaxed text-slate-200">
                        <h2 className="text-base font-semibold text-slate-50">
                          {item.title}
                        </h2>
                        {(item.artist_name || item.dating_text) && (
                          <p className="text-xs text-slate-400">
                            {item.artist_name && <span>{item.artist_name}</span>}
                            {item.artist_name && item.dating_text && <span> · </span>}
                            {item.dating_text && <span>{item.dating_text}</span>}
                          </p>
                        )}
                        {item.description && (
                          <p className="mt-2 whitespace-pre-line">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </div>
  );
}
