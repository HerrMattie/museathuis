"use client";

import { useEffect, useState } from "react";
import type { BestofResponse, BestofItem, BestofPeriod } from "@/lib/bestof";
import { RatingStars } from "@/components/rating/RatingStars";

export default function BestOfPage() {
  const [period, setPeriod] = useState<BestofPeriod>("week");
  const [data, setData] = useState<BestofResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/best-of?period=${period}`, {
          cache: "no-store",
        });
        const json: BestofResponse = await res.json();
        setData(json);
      } catch (e) {
        setData({
          status: "error",
          error: "Kon best-of niet laden.",
        } as BestofResponse);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [period]);

  function handlePeriodChange(next: BestofPeriod) {
    setPeriod(next);
  }

  return (
    <main className="min-h-screen p-6 flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-semibold">Best of MuseaThuis</h1>
          <p className="text-sm text-gray-400">
            Hoogst beoordeelde tours, games en focusmomenten.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-gray-600 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => handlePeriodChange("week")}
            className={
              "px-4 py-2 " +
              (period === "week"
                ? "bg-white text-black"
                : "bg-transparent text-gray-300")
            }
          >
            Deze week
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange("month")}
            className={
              "px-4 py-2 " +
              (period === "month"
                ? "bg-white text-black"
                : "bg-transparent text-gray-300")
            }
          >
            Deze maand
          </button>
        </div>
      </header>

      {isLoading && (
        <p className="text-sm text-gray-400">Laden van best-of lijst...</p>
      )}

      {!isLoading && data?.status === "error" && (
        <p className="text-sm text-red-500">{data.error}</p>
      )}

      {!isLoading && data?.status === "empty" && (
        <p className="text-sm text-gray-400">
          Er zijn nog niet genoeg beoordelingen om een best-of lijst te tonen.
        </p>
      )}

      {!isLoading && data?.status === "ok" && (
        <section className="grid gap-3">
          {data.items.map((item: BestofItem, index) => (
            <article
              key={`${item.content_type}-${item.content_id}`}
              className="flex gap-4 items-center border border-gray-700 rounded-2xl p-4 bg-[#050816]"
            >
              <div className="text-4xl font-semibold text-gray-600 w-10 text-right pr-2">
                {index + 1}.
              </div>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title ?? "Kunstwerk"}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="uppercase text-xs tracking-wide text-gray-400">
                    {item.content_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.rating_count} beoordelingen
                  </span>
                </div>
                <h2 className="text-lg font-semibold">
                  {item.title ?? "(zonder titel)"}
                </h2>
                {item.subtitle && (
                  <p className="text-sm text-gray-400">{item.subtitle}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <RatingStars
                    contentType={item.content_type}
                    contentId={item.content_id}
                    initialRating={Math.round(item.avg_rating)}
                  />
                  <span className="text-xs text-gray-400">
                    Gemiddeld {item.avg_rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}