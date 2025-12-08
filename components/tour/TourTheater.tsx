
"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "@/components/rating/RatingStars";

type TourItem = {
  id: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type TourMeta = {
  id: string;
  title: string;
  subtitle?: string | null;
  intro?: string | null;
};

type TourTodayOk = {
  status: "ok";
  meta: TourMeta;
  items: TourItem[];
};

type TourTodayEmpty = {
  status: "empty";
  meta?: TourMeta | null;
  items: [];
};

type TourTodayError = {
  status: "error";
  error: string;
};

type TourTodayResponse = TourTodayOk | TourTodayEmpty | TourTodayError;

export function TourTheater() {
  const [data, setData] = useState<TourTodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/tour/today", { cache: "no-store" });
        const json: TourTodayResponse = await res.json();
        setData(json);
        setIndex(0);
      } catch (e) {
        setData({
          status: "error",
          error: "Kon de tour van vandaag niet laden.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-5xl w-full">
          <div className="h-8 w-64 rounded-full bg-gray-800 mb-6 animate-pulse" />
          <div className="h-[420px] w-full rounded-3xl bg-gray-900 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!data || data.status === "error") {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-red-500 rounded-2xl p-4 bg-[#220000]">
          <h1 className="text-2xl font-semibold mb-2">Tour van vandaag</h1>
          <p className="text-sm text-red-200">
            {(data as any)?.error ?? "Er ging iets mis bij het laden van de tour."}
          </p>
        </div>
      </main>
    );
  }

  if (data.status === "empty" || !("items" in data) || data.items.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-gray-800 rounded-2xl p-4 bg-[#050816]">
          <h1 className="text-2xl font-semibold mb-2">Tour van vandaag</h1>
          <p className="text-sm text-gray-300">
            Er is nog geen tour voor vandaag ingepland.
          </p>
        </div>
      </main>
    );
  }

  const meta = data.meta;
  const works = data.items;
  const current = works[index];
  const total = works.length;
  const position = index + 1;

  function goNext() {
    setIndex((prev) => Math.min(prev + 1, total - 1));
  }

  function goPrev() {
    setIndex((prev) => Math.max(prev - 1, 0));
  }

  const progressPercent = total > 1 ? (position / total) * 100 : 100;

  const isOnLastWork = position === total;

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
            Tour van vandaag
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="text-sm text-gray-400">{meta.subtitle}</p>
          )}
          {meta.intro && (
            <p className="mt-2 text-sm md:text-base text-gray-300 max-w-3xl">
              {meta.intro}
            </p>
          )}
        </header>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 min-w-[90px] text-right">
            Werk {position} / {total}
          </div>
        </div>

        <section className="rounded-3xl bg-[#020617] border border-gray-800 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-black flex items-center justify-center">
            {current.image_url ? (
              <img
                src={current.image_url}
                alt={current.title}
                className="w-full h-full object-cover max-h-[480px]"
              />
            ) : (
              <div className="w-full h-full max-h-[480px] flex items-center justify-center text-gray-600 text-sm">
                Geen afbeelding beschikbaar
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-5 md:p-6 flex flex-col gap-3 max-h-[480px]">
            <div>
              <h2 className="text-xl font-semibold mb-1">{current.title}</h2>
              <p className="text-xs text-gray-400">
                {[current.artist_name, current.year_text, current.museum_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 text-sm text-gray-200">
              {current.text || (
                <p className="text-gray-500">
                  Voor dit werk is nog geen uitgebreide tekst beschikbaar.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-800 mt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={index === 0}
                  className="px-3 py-1.5 rounded-full border border-gray-600 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
                >
                  Vorig werk
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={index === total - 1}
                  className="px-3 py-1.5 rounded-full border border-yellow-500 text-xs text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  Volgend werk
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Gebruik ook de pijltjestoetsen om te navigeren.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-2 border-t border-gray-800 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium mb-1">Uw beoordeling van deze tour</h3>
            <p className="text-xs text-gray-400 max-w-xl">
              Geef na afloop een beoordeling. Dit helpt om de beste tours voor andere gebruikers te selecteren.
            </p>
          </div>
          <RatingStars
            contentType="tour"
            contentId={meta.id}
            size="md"
          />
        </section>
      </div>
    </main>
  );
}
