"use client";

import { useEffect, useState } from "react";

type Artwork = {
  id: number;
  title: string;
  artist_name: string | null;
  year_from: number | null;
  year_to: number | null;
  image_url: string | null;
  description_primary: string | null;
};

type TourItem = {
  id: string;
  order_index: number;
  artwork_id: number;
  artwork: Artwork | null;
};

type Tour = {
  id: string;
  date: string;
  title: string;
  intro: string | null;
  is_premium: boolean;
  items: TourItem[];
};

type ApiResponse = {
  tour: Tour;
};

export default function TourTodayPage() {
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadTour = async () => {
      try {
        setLoading(true);

        // Page event logging (best effort)
        fetch("/api/track/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ route: "/tour/today" }),
        }).catch(() => {});

        const res = await fetch("/api/tour/today", {
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Er is geen dagtour beschikbaar.");
          setLoading(false);
          return;
        }

        const data: ApiResponse = await res.json();
        setTour(data.tour);
        setIndex(0);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het ophalen van de dagtour.");
        setLoading(false);
      }
    };

    loadTour();
  }, []);

  useEffect(() => {
    if (!tour) return;
    const currentItem = tour.items[index];

    // Content event logging (best effort, zonder seconds_viewed)
    fetch("/api/track/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "tour",
        artworkId: currentItem.artwork_id,
        tourId: tour.id,
      }),
    }).catch(() => {});
  }, [tour, index]);

  const handlePrev = () => {
    if (!tour) return;
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    if (!tour) return;
    setIndex((prev) =>
      !tour ? prev : prev < tour.items.length - 1 ? prev + 1 : prev
    );
  };

  const handleRate = async (value: number) => {
    if (!tour) return;
    setRating(value);
    setRatingMessage(null);

    try {
      const res = await fetch("/api/tour/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId: tour.id, rating: value }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRatingMessage(data.error || "Beoordeling opslaan mislukt.");
      } else {
        setRatingMessage("Bedankt voor je beoordeling.");
      }
    } catch (e) {
      console.error(e);
      setRatingMessage("Beoordeling opslaan mislukt.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p>Dagtour wordt geladen...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Dagtour</h1>
        <p className="text-red-600">
          {error || "Er is geen dagtour gevonden."}
        </p>
      </div>
    );
  }

  const currentItem = tour.items[index];
  const artwork = currentItem.artwork;
  const positionLabel = `${index + 1} / ${tour.items.length}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{tour.title}</h1>
        {tour.intro && (
          <p className="text-base text-gray-700">{tour.intro}</p>
        )}
        <p className="text-sm text-gray-500">
          Dagtour {tour.date} · {positionLabel}
        </p>
      </header>

      <section className="bg-white rounded-2xl shadow-md p-4 md:p-6 space-y-4">
        <div className="w-full flex justify-center items-center bg-black rounded-xl overflow-hidden aspect-[16/9]">
          {artwork?.image_url ? (
            <img
              src={artwork.image_url}
              alt={artwork.title || "Kunstwerk"}
              className="h-full w-auto object-contain"
            />
          ) : (
            <div className="text-white text-sm">
              Geen afbeelding beschikbaar
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {artwork?.title || "Onbekende titel"}
          </h2>

          <p className="text-sm text-gray-700">
            <span className="font-medium">Kunstenaar:</span>{" "}
            {artwork?.artist_name || "Onbekend"}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-medium">Datering:</span>{" "}
            {artwork?.year_from
              ? artwork.year_to && artwork.year_to !== artwork.year_from
                ? `${artwork.year_from} - ${artwork.year_to}`
                : artwork.year_from
              : "Onbekend"}
          </p>

          {artwork?.description_primary && (
            <p className="mt-3 text-base text-gray-800 leading-relaxed">
              {artwork.description_primary}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-full text-sm border border-gray-300 disabled:opacity-40"
            disabled={index === 0}
          >
            Vorige
          </button>

          <span className="text-sm text-gray-600">{positionLabel}</span>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-full text-sm border border-gray-300 disabled:opacity-40"
            disabled={index === tour.items.length - 1}
          >
            Volgende
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-sm text-gray-700">
            Beoordeel deze dagtour:
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                className={`w-8 h-8 rounded-full border text-sm ${
                  rating === value ? "bg-gray-900 text-white" : "bg-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {ratingMessage && (
            <p className="text-xs text-gray-600">{ratingMessage}</p>
          )}
        </div>
      </section>
    </div>
  );
}