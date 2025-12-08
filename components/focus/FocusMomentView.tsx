
"use client";

import { useEffect, useState } from "react";
import RatingStars from "@/components/rating/RatingStars";

type FocusItem = {
  id: string;
  title: string;
  image_url?: string | null;
  artist_name?: string | null;
  year_text?: string | null;
  museum_name?: string | null;
  text?: string | null;
};

type FocusMeta = {
  id: string;
  title: string;
  intro?: string | null;
  duration_min?: number | null;
};

type FocusOkShapeA = {
  status: "ok";
  meta: FocusMeta;
  item: FocusItem;
};

type FocusOkShapeB = {
  status: "ok";
  meta: FocusMeta;
  items: FocusItem[];
};

type FocusEmpty = {
  status: "empty";
  meta?: FocusMeta | null;
};

type FocusError = {
  status: "error";
  error: string;
};

type FocusTodayResponse = FocusOkShapeA | FocusOkShapeB | FocusEmpty | FocusError;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function FocusMomentView() {
  const [data, setData] = useState<FocusTodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [initialDuration, setInitialDuration] = useState(0);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/focus/today", { cache: "no-store" });
        const json: FocusTodayResponse = await res.json();
        setData(json);

        if (json && json.status === "ok") {
          const meta = json.meta;
          const durationMin = meta.duration_min ?? 5;
          const seconds = Math.max(1, Math.round(durationMin * 60));
          setRemaining(seconds);
          setInitialDuration(seconds);
        } else {
          setRemaining(0);
          setInitialDuration(0);
        }
      } catch (e) {
        setData({
          status: "error",
          error: "Kon het focusmoment van vandaag niet laden.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  function handleStartPause() {
    if (!initialDuration) {
      return;
    }
    if (remaining === 0) {
      setRemaining(initialDuration);
      setRunning(true);
      return;
    }
    setRunning((prev) => !prev);
  }

  function handleReset() {
    setRunning(false);
    setRemaining(initialDuration);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="h-6 w-40 rounded-full bg-gray-800 mb-4 animate-pulse" />
          <div className="h-[420px] w-full rounded-3xl bg-gray-900 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!data || data.status === "error") {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-red-500 rounded-2xl p-4 bg-[#220000]">
          <h1 className="text-2xl font-semibold mb-2">Focusmoment</h1>
          <p className="text-sm text-red-200">
            {(data as any)?.error ?? "Er ging iets mis bij het laden van het focusmoment."}
          </p>
        </div>
      </main>
    );
  }

  if (data.status === "empty") {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-gray-800 rounded-2xl p-4 bg-[#050816]">
          <h1 className="text-2xl font-semibold mb-2">Focusmoment</h1>
          <p className="text-sm text-gray-300">
            Er is nog geen focusmoment voor vandaag ingepland.
          </p>
        </div>
      </main>
    );
  }

  if (data.status !== "ok") {
    return null;
  }

  const meta = data.meta;
  const work: FocusItem | undefined =
    "item" in data ? data.item : data.items && data.items.length > 0 ? data.items[0] : undefined;

  if (!work) {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-gray-800 rounded-2xl p-4 bg-[#050816]">
          <h1 className="text-2xl font-semibold mb-2">Focusmoment</h1>
          <p className="text-sm text-gray-300">
            Het focusmoment kon niet worden geladen.
          </p>
        </div>
      </main>
    );
  }

  const recommendedMinutes = (meta.duration_min ?? Math.round(initialDuration / 60)) || 5;
  const timerLabel =
    remaining === 0 && initialDuration > 0
      ? "Rustmoment afgerond"
      : running
      ? "Rustmoment bezig"
      : "Klaar om te starten";

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-300">
            Focusmoment van vandaag
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            {meta.title || work.title}
          </h1>
          {meta.intro && (
            <p className="text-sm md:text-base text-gray-300 max-w-3xl mt-1">
              {meta.intro}
            </p>
          )}
        </header>

        <section className="rounded-3xl bg-[#020617] border border-gray-800 overflow-hidden flex flex-col">
          <div className="bg-black flex items-center justify-center">
            {work.image_url ? (
              <img
                src={work.image_url}
                alt={work.title}
                className="w-full max-h-[480px] object-contain"
              />
            ) : (
              <div className="w-full h-[320px] flex items-center justify-center text-gray-600 text-sm">
                Geen afbeelding beschikbaar
              </div>
            )}
          </div>

          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">{work.title}</h2>
              <p className="text-xs text-gray-400">
                {[work.artist_name, work.year_text, work.museum_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="text-sm text-gray-200 max-w-3xl">
              {work.text || (
                <p className="text-gray-500">
                  Voor dit focusmoment is nog geen uitgebreide tekst beschikbaar. Gebruik het beeld om even tot rust te komen.
                </p>
              )}
            </div>

            {initialDuration > 0 && (
              <div className="mt-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full border border-teal-400 flex items-center justify-center text-sm font-mono">
                    {formatTime(remaining || initialDuration)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-300">{timerLabel}</span>
                    <span className="text-xs text-gray-500">
                      Aanbevolen duur: ongeveer {recommendedMinutes} minuten.
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStartPause}
                    className="px-4 py-1.5 rounded-full border border-teal-400 text-xs text-teal-200 hover:bg-teal-400 hover:text-black transition-colors"
                  >
                    {running ? "Pauzeer" : remaining === 0 && initialDuration > 0 ? "Opnieuw starten" : "Start rustmoment"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!initialDuration}
                    className="px-3 py-1.5 rounded-full border border-gray-600 text-xs text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-2 border-t border-gray-800 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium mb-1">Uw beoordeling van dit focusmoment</h3>
            <p className="text-xs text-gray-400 max-w-xl">
              Een korte beoordeling helpt om de meest waardevolle rustmomenten voor andere gebruikers te kiezen.
            </p>
          </div>
          <RatingStars
            contentType="focus"
            contentId={meta.id}
            size="md"
          />
        </section>
      </div>
    </main>
  );
}
