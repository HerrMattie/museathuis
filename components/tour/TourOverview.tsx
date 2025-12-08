
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TourSlotSummary = {
  id: string;
  title: string;
  intro?: string | null;
  is_premium: boolean;
  slot_key: string | null;
};

type TourTodayListOk = {
  status: "ok";
  date: string;
  items: TourSlotSummary[];
};

type TourTodayListEmpty = {
  status: "empty";
  date: string;
  items: TourSlotSummary[];
};

type TourTodayListError = {
  status: "error";
  error: string;
};

type TourTodayListResponse =
  | TourTodayListOk
  | TourTodayListEmpty
  | TourTodayListError;

export function TourOverview() {
  const [data, setData] = useState<TourTodayListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/tour/today", { cache: "no-store" });
        const json: TourTodayListResponse = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setData({
          status: "error",
          error: "Kon de tours van vandaag niet laden.",
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
        <div className="w-full max-w-5xl space-y-4">
          <div className="h-8 w-64 rounded-full bg-gray-800 animate-pulse" />
          <div className="h-24 w-full rounded-2xl bg-gray-900 animate-pulse" />
          <div className="h-24 w-full rounded-2xl bg-gray-900 animate-pulse" />
          <div className="h-24 w-full rounded-2xl bg-gray-900 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!data || data.status === "error") {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-red-500 rounded-2xl p-4 bg-[#220000]">
          <h1 className="text-2xl font-semibold mb-2">Tours</h1>
          <p className="text-sm text-red-200">
            {(data as any)?.error ?? "Er ging iets mis bij het laden van de tours."}
          </p>
        </div>
      </main>
    );
  }

  if (data.status === "empty") {
    return (
      <main className="min-h-screen px-4 py-8 flex flex-col items-center">
        <div className="max-w-3xl w-full border border-gray-800 rounded-2xl p-4 bg-[#050816]">
          <h1 className="text-2xl font-semibold mb-2">Tours</h1>
          <p className="text-sm text-gray-300">
            Er zijn vandaag nog geen tours ingepland.
          </p>
        </div>
      </main>
    );
  }

  const items = data.items;

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <header className="flex flex-col gap-2 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
            Tours
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            Ontdek de tours van vandaag
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Elke tour is een korte ontdekkingstocht langs ongeveer acht kunstwerken rond een thema,
            met toelichting in heldere museale taal. Kies een tour die bij uw stemming past.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((tour) => (
            <Link
              key={tour.id + String(tour.slot_key ?? "")}
              href={`/tour/${tour.id}`}
              className="group rounded-2xl border border-gray-800 bg-[#020617] p-4 flex flex-col justify-between hover:border-yellow-400 hover:bg-[#050816] transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full border border-gray-700 text-gray-300">
                    {tour.is_premium ? "Premium" : "Gratis"}
                  </span>
                  {tour.slot_key && (
                    <span className="text-xs text-gray-500">
                      Slot {tour.slot_key}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold leading-snug group-hover:text-yellow-300">
                  {tour.title}
                </h2>
                {tour.intro && (
                  <p className="text-xs text-gray-400 line-clamp-3">
                    {tour.intro}
                  </p>
                )}
              </div>
              <div className="mt-3 text-xs text-yellow-300">
                Bekijk tour
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
