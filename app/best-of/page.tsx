
"use client";

import { useEffect, useState } from "react";
import type { BestofResponse, BestofItem } from "@/lib/bestof";
import RatingStars from "@/components/rating/RatingStars";

type SectionState = {
  isLoading: boolean;
  data: BestofResponse | null;
};

export default function BestOfPage() {
  const [week, setWeek] = useState<SectionState>({
    isLoading: true,
    data: null,
  });
  const [month, setMonth] = useState<SectionState>({
    isLoading: true,
    data: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const [weekRes, monthRes] = await Promise.all([
          fetch("/api/best-of?period=week", { cache: "no-store" }),
          fetch("/api/best-of?period=month", { cache: "no-store" }),
        ]);

        const weekJson: BestofResponse = await weekRes.json();
        const monthJson: BestofResponse = await monthRes.json();

        setWeek({ isLoading: false, data: weekJson });
        setMonth({ isLoading: false, data: monthJson });
      } catch (e) {
        setWeek({
          isLoading: false,
          data: {
            status: "error",
            error: "Kon best-of voor deze week niet laden.",
          },
        });
        setMonth({
          isLoading: false,
          data: {
            status: "error",
            error: "Kon best-of voor deze maand niet laden.",
          },
        });
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen p-6 flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-3xl font-semibold">Best of MuseaThuis</h1>
        <p className="text-sm text-gray-400">
          Hoogst beoordeelde tours, games en focusmomenten, per periode.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <BestofSection title="Deze week" state={week} />
        <BestofSection title="Deze maand" state={month} />
      </div>
    </main>
  );
}

type BestofSectionProps = {
  title: string;
  state: SectionState;
};

function BestofSection({ title, state }: BestofSectionProps) {
  if (state.isLoading) {
    return (
      <section className="border border-gray-800 rounded-2xl p-4 bg-[#050816]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-gray-400">Laden van best-of lijst...</p>
      </section>
    );
  }

  const data = state.data;

  if (!data || data.status === "error") {
    return (
      <section className="border border-gray-800 rounded-2xl p-4 bg-[#050816]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-red-500">
          {(data as any)?.error ?? "Best-of lijst kon niet worden geladen."}
        </p>
      </section>
    );
  }

  if (data.status === "empty") {
    return (
      <section className="border border-gray-800 rounded-2xl p-4 bg-[#050816]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-sm text-gray-400">
          Er zijn nog niet genoeg beoordelingen om een best-of lijst te tonen.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-gray-800 rounded-2xl p-4 bg-[#050816]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-xs text-gray-500">
          {data.items.length} geselecteerde items
        </p>
      </div>
      <div className="grid gap-3">
        {data.items.map((item: BestofItem, index: number) => (
          <article
            key={`${item.content_type}-${item.content_id}`}
            className="flex gap-4 items-center border border-gray-700 rounded-2xl p-3 bg-[#020617]"
          >
            <div className="text-3xl font-semibold text-gray-600 w-8 text-right pr-1">
              {index + 1}.
            </div>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title ?? "Kunstwerk"}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
              />
            )}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="uppercase text-[10px] tracking-wide text-gray-400">
                  {item.content_type}
                </span>
                <span className="text-[10px] text-gray-500">
                  {item.rating_count} beoordelingen
                </span>
              </div>
              <h3 className="text-sm font-semibold">
                {item.title ?? "(zonder titel)"}
              </h3>
              {item.subtitle && (
                <p className="text-xs text-gray-400">{item.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <RatingStars
                  contentType={item.content_type}
                  contentId={item.content_id}
                  initialRating={Math.round(item.avg_rating)}
                  size="sm"
                />
                <span className="text-[10px] text-gray-400">
                  Gemiddeld {item.avg_rating.toFixed(1)} / 5
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
