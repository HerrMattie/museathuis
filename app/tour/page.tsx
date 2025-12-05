"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { RatingStars } from "@/components/RatingStars";

type LoadState = "idle" | "loading" | "loaded" | "empty" | "error";

type TourMeta = {
  id: string;
  title: string;
  subtitle: string | null;
  theme: string | null;
  level: string | null;
  intro: string | null;
};

type Artwork = {
  id: string;
  title: string;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
};

type TourStop = {
  id: string;
  order: number;
  title: string;
  text: string | null;
  artwork: Artwork | null;
};

export default function TourTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [meta, setMeta] = useState<TourMeta | null>(null);
  const [stops, setStops] = useState<TourStop[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [ownRating, setOwnRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    void loadTodayTour();
  }, []);

  useEffect(() => {
    if (!meta) return;
    void loadUserAndRating(meta.id);
  }, [meta?.id]);

  async function loadTodayTour() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      // 1. Haal tour_id uit dagprogramma
      const { data: scheduleRows, error: scheduleError } = await supabase
        .from("dayprogram_schedule")
        .select("tour_id")
        .eq("day_date", today)
        .limit(1);

      if (scheduleError) {
        console.error("Fout dagprogram_schedule (tour):", scheduleError);
        throw scheduleError;
      }

      const tourId = scheduleRows && scheduleRows.length > 0 ? scheduleRows[0].tour_id : null;

      if (!tourId) {
        setState("empty");
        return;
      }

      // 2. Haal tour op (flexibel schema)
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

      const metaObj: TourMeta = {
        id: String(tour.id),
        title: tour.title || tour.name || "Tour van vandaag",
        subtitle: tour.subtitle || tour.tagline || null,
        theme: tour.theme || tour.category || null,
        level: tour.level || tour.difficulty || null,
        intro: tour.intro_text || tour.description || null,
      };
      setMeta(metaObj);

      // 3. Haal tour_items op
      const { data: itemRows, error: itemsError } = await supabase
        .from("tour_items")
        .select("*")
        .eq("tour_id", tour.id);

      if (itemsError) {
        console.error("Fout tour_items:", itemsError);
        throw itemsError;
      }

      const items = (itemRows ?? []) as any[];

      if (!items.length) {
        setStops([]);
        setState("loaded");
        return;
      }

      // 4. Verzamel artworks
      const artworkIds = Array.from(
        new Set(
          items
            .map((it) => it.artwork_id || it.artwork || null)
            .filter((v) => !!v)
            .map((v) => String(v))
        )
      );

      let artworksById: Record<string, Artwork> = {};
      if (artworkIds.length > 0) {
        const { data: artRows, error: artError } = await supabase
          .from("artworks")
          .select("id, title, artist_name, dating_text, image_url")
          .in("id", artworkIds);

        if (artError) {
          console.error("Fout artworks:", artError);
          throw artError;
        }

        for (const art of artRows ?? []) {
          const a = art as any;
          artworksById[String(a.id)] = {
            id: String(a.id),
            title: a.title ?? "Onbenoemd kunstwerk",
            artist_name: a.artist_name ?? null,
            dating_text: a.dating_text ?? null,
            image_url: a.image_url ?? null,
          };
        }
      }

      const stopsMapped: TourStop[] = items
        .map((it) => {
          const order =
            typeof it.position === "number"
              ? it.position
              : typeof it.sequence === "number"
              ? it.sequence
              : typeof it.order_index === "number"
              ? it.order_index
              : 9999;

          const artworkId: string | null =
            it.artwork_id || it.artwork || null;

          const artwork = artworkId ? artworksById[String(artworkId)] ?? null : null;

          return {
            id: String(it.id),
            order,
            title: it.title || it.section_title || it.heading || "Zonder titel",
            text: it.body || it.section_text || it.description || null,
            artwork,
          } as TourStop;
        })
        .sort((a, b) => a.order - b.order);

      setStops(stopsMapped);
      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden tour van vandaag:", e);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Tour
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Tour van vandaag"}
            </h1>
            {meta?.subtitle && (
              <p className="mt-1 text-sm text-slate-300">{meta.subtitle}</p>
            )}
            {meta?.theme && (
              <p className="mt-1 text-xs text-slate-400">Thema: {meta.theme}</p>
            )}

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
            toe aan de tabel <code>dayprogram_schedule</code> om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && (
          <div className="space-y-6">
            {meta?.intro && (
              <div className="rounded-3xl bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
                <p className="whitespace-pre-line">{meta.intro}</p>
              </div>
            )}

            {stops.map((stop, index) => (
              <section
                key={stop.id}
                className="overflow-hidden rounded-3xl bg-slate-900/80 p-4 sm:p-6 lg:p-8"
              >
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Werk {index + 1}
                  </div>
                  {stop.artwork?.artist_name && (
                    <div className="text-[11px] text-slate-400">
                      {stop.artwork.artist_name}
                      {stop.artwork.dating_text && <> · {stop.artwork.dating_text}</>}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-950">
                    {stop.artwork?.image_url ? (
                      <Image
                        src={stop.artwork.image_url}
                        alt={stop.artwork.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        Geen afbeelding beschikbaar
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-50">
                      {stop.artwork?.title ?? stop.title}
                    </h2>
                    {stop.text ? (
                      <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                        {stop.text}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Voor dit werk is nog geen uitgebreide tourtekst ingevuld. Voeg in het CRM
                        een toelichting toe aan dit tour-item om die hier te tonen.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))}

            {stops.length === 0 && (
              <div className="rounded-3xl bg-slate-900/80 p-6 text-sm text-slate-300">
                Deze tour heeft nog geen werken gekoppeld. Voeg in het CRM tour-items toe om de tour
                te vullen.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
