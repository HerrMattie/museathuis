
"use client";

import { useEffect, useState } from "react";

type RatingStarsProps = {
  contentType: string;
  contentId: string;
};

type RatingResponse =
  | { status: "ok"; rating?: number | null }
  | { status: "error"; error: string };

export default function RatingStars({
  contentType,
  contentId,
}: RatingStarsProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Probeer bestaande rating op te halen (best effort)
  useEffect(() => {
    let cancelled = false;

    async function loadRating() {
      try {
        const params = new URLSearchParams({
          contentType,
          contentId,
        });
        const res = await fetch(`/api/ratings?${params.toString()}`, {
          method: "GET",
        });
        if (!res.ok) return;
        const data = (await res.json()) as RatingResponse;
        if (!cancelled && data.status === "ok" && typeof data.rating === "number") {
          setCurrent(data.rating);
        }
      } catch {
        // stil falen; geen hard error in UI
      }
    }

    loadRating();

    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  async function handleRate(value: number) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType,
          contentId,
          rating: value,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setCurrent(value);
    } catch (err: any) {
      setError(err?.message ?? "Beoordeling opslaan is niet gelukt.");
    } finally {
      setSubmitting(false);
    }
  }

  const display = hover ?? current ?? 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= display;
          return (
            <button
              key={value}
              type="button"
              disabled={submitting}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleRate(value)}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-lg transition-colors ${
                active
                  ? "text-yellow-300"
                  : "text-gray-500 hover:text-gray-300"
              } ${submitting ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
              aria-label={`Geef beoordeling ${value} van 5`}
            >
              {active ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      {current != null && (
        <p className="text-[11px] text-gray-400">
          Uw beoordeling: {current} / 5
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
