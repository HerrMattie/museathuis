"use client";

import { useEffect, useState } from "react";

type Artwork = {
  id: string;
  title: string;
  artist_name: string | null;
  year_from: number | null;
  year_to: number | null;
  image_url: string | null;
  description_primary: string | null;
};

type Focus = {
  id: string;
  date: string;
  long_text: string | null;
  audio_url: string | null;
  artwork: Artwork;
};

type ApiResponse = {
  focus: Focus;
};

export default function FocusTodayPage() {
  const [focus, setFocus] = useState<Focus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingStatus, setRatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadFocus = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/focus/today", { cache: "no-store" });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Er is geen focusmoment beschikbaar.");
          setLoading(false);
          return;
        }

        const data: ApiResponse = await res.json();
        setFocus(data.focus);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het ophalen van het focusmoment.");
        setLoading(false);
      }
    };

    loadFocus();
  }, []);

  const handleRating = async (value: number) => {
    if (!focus) return;
    setRating(value);
    setRatingStatus("Beoordeling wordt opgeslagen...");

    try {
      const res = await fetch("/api/focus/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusItemId: focus.id, rating: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setRatingStatus(
          body.error || "Opslaan van de beoordeling is niet gelukt."
        );
        return;
      }

      setRatingStatus("Beoordeling opgeslagen, dank je wel.");
    } catch (e) {
      console.error(e);
      setRatingStatus("Opslaan van de beoordeling is niet gelukt.");
    }
  };

  if (loading) {
    return (
      <div>
        <p>Focusmoment wordt geladen...</p>
      </div>
    );
  }

  if (error || !focus) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">
          Focusmoment van vandaag
        </h1>
        <p className="text-red-600">
          {error || "Er is geen focusmoment gevonden."}
        </p>
      </div>
    );
  }

  const artwork = focus.artwork;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Focusmoment van vandaag</h1>
        <p className="text-sm text-slate-400">Datum {focus.date}</p>
      </header>

      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 space-y-4">
        <div className="w-full flex justify-center items-center bg-black rounded-xl overflow-hidden aspect-[16/9]">
          {artwork.image_url ? (
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
            {artwork.title || "Onbekende titel"}
          </h2>

          <p className="text-sm text-slate-300">
            <span className="font-medium">Kunstenaar:</span>{" "}
            {artwork.artist_name || "Onbekend"}
          </p>

          <p className="text-sm text-slate-300">
            <span className="font-medium">Datering:</span>{" "}
            {artwork.year_from
              ? artwork.year_to && artwork.year_to !== artwork.year_from
                ? `${artwork.year_from} - ${artwork.year_to}`
                : artwork.year_from
              : "Onbekend"}
          </p>

          {focus.long_text && (
            <p className="mt-3 text-base text-slate-100 leading-relaxed whitespace-pre-line">
              {focus.long_text}
            </p>
          )}

          {artwork.description_primary && (
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {artwork.description_primary}
            </p>
          )}

          {focus.audio_url && (
            <div className="mt-4">
              <audio controls src={focus.audio_url} className="w-full">
                Je browser ondersteunt het audio-element niet.
              </audio>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm text-slate-300">
          Hoe waardeer je dit focusmoment?
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRating(value)}
              className={`w-9 h-9 rounded-full border text-sm ${
                rating === value
                  ? "bg-yellow-400 text-slate-900 border-yellow-400"
                  : "bg-slate-900 text-slate-100 border-slate-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {ratingStatus && (
          <p className="text-xs text-slate-400">{ratingStatus}</p>
        )}
      </section>
    </div>
  );
}