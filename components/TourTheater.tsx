"use client";

import { useState } from "react";

type ArtworkItem = {
  id: string;
  title: string;
  artist?: string | null;
  year_from?: number | null;
  year_to?: number | null;
  object_type?: string | null;
  material?: string | null;
  image_url?: string | null;
  ai_text?: string | null;
};

type Props = {
  tourTitle: string;
  tourIntro?: string | null;
  items: ArtworkItem[];
};

export function TourTheater({ tourTitle, tourIntro, items }: Props) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  function next() {
    setIndex((i) => (i + 1 < items.length ? i + 1 : i));
  }
  function prev() {
    setIndex((i) => (i - 1 >= 0 ? i - 1 : i));
  }

  if (!current) {
    return <div className="p-6">Geen werken in deze tour.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{tourTitle}</h1>
        {tourIntro && (
          <p className="text-sm text-neutral-700">{tourIntro}</p>
        )}
      </header>

      <section className="space-y-4">
        <div className="bg-black rounded-xl overflow-hidden flex items-center justify-center aspect-video">
          {current.image_url ? (
            <img
              src={current.image_url}
              alt={current.title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-white text-sm">Geen afbeelding beschikbaar</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{current.title}</h2>
              <p className="text-sm text-neutral-700">
                {current.artist ?? "Onbekende kunstenaar"}
                {current.year_from && (
                  <> · {current.year_from}{current.year_to && current.year_to !== current.year_from ? `–${current.year_to}` : ""}</>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                {current.object_type && <>{current.object_type}</>}
                {current.material && <> · {current.material}</>}
              </p>
            </div>
            <div className="text-xs text-neutral-500">
              Werk {index + 1} van {items.length}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2 text-sm leading-relaxed">
            <p>{current.ai_text ?? "De tekst voor dit werk is nog in bewerking."}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <button
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                onClick={prev}
                disabled={index === 0}
              >
                Vorige
              </button>
              <button
                className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                onClick={next}
                disabled={index === items.length - 1}
              >
                Volgende
              </button>
            </div>
            <button className="rounded-full bg-neutral-900 text-white px-4 py-1 text-xs">
              Audio luisteren
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
