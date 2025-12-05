"use client";

import { useEffect, useState } from "react";

type Artwork = {
  id: string;
  title?: string | null;
  artist_name?: string | null;
  artist_normalized?: string | null;
  dating_text?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  museum?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  image_url?: string | null;
};

type TourItem = {
  id: string;
  order_index: number;
  text_short?: string | null;
  text_long?: string | null;
  audio_url?: string | null;
  tags?: string | null;
  artwork: Artwork;
};

type Tour = {
  id: string;
  date: string;
  title: string;
  intro?: string | null;
  is_premium?: boolean | null;
  status?: string | null;
};

type RatingSummary = {
  averageRating: number | null;
  ratingCount: number;
};

type TourTodayResponse =
  | {
      code: "NO_TOUR_FOR_TODAY";
      message: string;
    }
  | {
      tour: Tour;
      items: TourItem[];
      ratingSummary: RatingSummary;
    };

export default function TourTodayPage() {
  const [data, setData] = useState<TourTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackingSentFor, setTrackingSentFor] = useState<Set<number>>(new Set());

  const isNoTour = (d: TourTodayResponse | null): d is { code: "NO_TOUR_FOR_TODAY"; message: string } =>
    !!d && (d as any).code === "NO_TOUR_FOR_TODAY";

  const isTourData = (d: TourTodayResponse | null): d is { tour: Tour; items: TourItem[]; ratingSummary: RatingSummary } =>
    !!d && (d as any).tour;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/tour/today", { cache: "no-store" });
        const body = (await res.json()) as TourTodayResponse;
        setData(body);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("De dagtour kon niet worden geladen.");
        setLoading(false);
      }
    };

    load();
  }, []);

  // Tracking wanneer gebruiker naar een item navigeert
  useEffect(() => {
    if (!isTourData(data)) return;
    if (data.items.length === 0) return;

    if (trackingSentFor.has(currentIndex)) return;

    const item = data.items[currentIndex];
    if (!item) return;

    const sendTracking = async () => {
      try {
        await fetch("/api/track/tour-artwork", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tour_id: data.tour.id,
            artwork_id: item.artwork.id,
            order_index: item.order_index,
          }),
        });
        setTrackingSentFor((prev) => new Set(prev).add(currentIndex));
      } catch (e) {
        console.error("Tracking failed", e);
      }
    };

    sendTracking();
  }, [currentIndex, data, trackingSentFor]);

  const handlePrev = () => {
    if (!isTourData(data)) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!isTourData(data)) return;
    setCurrentIndex((prev) => Math.min(data.items.length - 1, prev + 1));
  };

  const handleRate = async (value: number) => {
    if (!isTourData(data)) return;
    setRating(value);
    setRatingMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/tour/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: data.tour.id,
          rating: value,
        }),
      });

      const body = await res.json().catch(() => ({} as any));

      if (!res.ok || (body as any).error) {
        setError("Je beoordeling kon niet worden opgeslagen.");
        return;
      }

      setRatingMessage("Dank je, je beoordeling is opgeslagen.");
    } catch (e) {
      console.error(e);
      setError("Je beoordeling kon niet worden opgeslagen.");
    }
  };

  if (loading) {
    return <p>Dagelijkse tour wordt geladen...</p>;
  }

  if (isNoTour(data)) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Dagtour</h1>
        <p className="text-sm text-slate-300">{data.message}</p>
        <p className="text-sm text-slate-400">
          Je kunt in het CRM een dagprogramma genereren en publiceren. Zodra er een tour beschikbaar is,
          verschijnt deze automatisch op deze pagina.
        </p>
      </div>
    );
  }

  if (!isTourData(data)) {
    return <p>Er ging iets mis bij het laden van de dagtour.</p>;
  }

  const { tour, items, ratingSummary } = data;

  if (!items || items.length === 0) {
    return (
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Dagtour</h1>
        <p className="text-sm text-slate-300">
          Voor deze tour zijn nog geen werken gekoppeld. Vul de tour in het CRM aan en publiceer opnieuw.
        </p>
      </div>
    );
  }

  const current = items[currentIndex];
  const total = items.length;
  const artist =
    current.artwork.artist_name ||
    current.artwork.artist_normalized ||
    "Onbekende kunstenaar";

  const positionLabel = `Werk ${currentIndex + 1} van ${total}`;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Dagtour</h1>
        <p className="text-lg font-semibold">{tour.title}</p>
        {tour.intro && <p className="text-sm text-slate-300 max-w-2xl">{tour.intro}</p>}
        {ratingSummary && ratingSummary.ratingCount > 0 && (
          <p className="text-xs text-slate-400">
            Gemiddelde beoordeling:{" "}
            {ratingSummary.averageRating?.toFixed(1)} / 5 ({ratingSummary.ratingCount} beoordelingen)
          </p>
        )}
      </header>

      <section className="grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <div className="aspect-[4/3] w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
            {current.artwork.image_url ? (
              <img
                src={current.artwork.image_url}
                alt={current.artwork.title ?? "Kunstwerk"}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-sm text-slate-500">Afbeelding niet beschikbaar</div>
            )}
          </div>
          <p className="text-xs text-slate-400">{positionLabel}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-full border border-slate-600 text-sm disabled:opacity-40"
            >
              Vorig werk
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === total - 1}
              className="px-4 py-2 rounded-full border border-slate-600 text-sm disabled:opacity-40"
            >
              Volgend werk
            </button>
          </div>
        </div>

        <article className="space-y-3">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">
              {current.artwork.title || "Zonder titel"}
            </h2>
            <p className="text-sm text-slate-300">
              {artist}
              {current.artwork.dating_text
                ? `, ${current.artwork.dating_text}`
                : current.artwork.year_from
                ? `, ${current.artwork.year_from}${
                    current.artwork.year_to && current.artwork.year_to !== current.artwork.year_from
                      ? `–${current.artwork.year_to}`
                      : ""
                  }`
                : ""}
            </p>
            {(current.artwork.museum || current.artwork.location_city || current.artwork.location_country) && (
              <p className="text-xs text-slate-400">
                {[current.artwork.museum, current.artwork.location_city, current.artwork.location_country]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </header>

          {current.text_short && (
            <p className="text-sm text-slate-200 whitespace-pre-line">
              {current.text_short}
            </p>
          )}

          {current.text_long && (
            <details className="mt-2">
              <summary className="text-sm text-slate-300 cursor-pointer">
                Lees uitgebreide toelichting
              </summary>
              <div className="mt-2 text-sm text-slate-200 whitespace-pre-line">
                {current.text_long}
              </div>
            </details>
          )}

          {current.tags && (
            <p className="text-xs text-slate-400">
              Thema&apos;s: {current.tags}
            </p>
          )}
        </article>
      </section>

      {currentIndex === total - 1 && (
        <section className="space-y-2 border-t border-slate-800 pt-4">
          <h3 className="text-lg font-semibold">Hoe vond je deze tour?</h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                className={`w-8 h-8 rounded-full border text-sm ${
                  rating === value
                    ? "border-amber-400 bg-amber-500/20"
                    : "border-slate-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {ratingMessage && (
            <p className="text-xs text-emerald-400">{ratingMessage}</p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </section>
      )}
    </div>
  );
}