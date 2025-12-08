
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/ratings/RatingStars";

type TourMeta = {
  id: string;
  title: string;
  subtitle?: string | null;
  theme?: string | null;
  detail_intro?: string | null;
  overview_intro?: string | null;
  experience_text?: string | null;
  user_hints?: string | null;
  closing_text?: string | null;
  is_premium?: boolean | null;
  publish_date?: string | null;
};

type TourItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  artist?: string | null;
  year?: string | null;
  description?: string | null;
};

interface TourTheaterProps {
  meta: TourMeta;
  items: TourItem[];
}

export default function TourTheater({ meta, items }: TourTheaterProps) {
  const [index, setIndex] = useState(0);

  const works = items ?? [];
  const current = works[index] ?? null;

  const total = works.length;
  const positionLabel = total > 0 ? `${index + 1} / ${total}` : "0 / 0";

  const dateLabel = useMemo(() => {
    if (!meta.publish_date) return null;
    try {
      return new Date(meta.publish_date).toLocaleDateString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  }, [meta.publish_date]);

  const goPrev = () => {
    if (total === 0) return;
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    if (total === 0) return;
    setIndex((prev) => (prev < total - 1 ? prev + 1 : prev));
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-400">
              Tour
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p className="text-sm text-gray-300 max-w-2xl">{meta.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              {meta.theme && (
                <span className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1">
                  Thema: {meta.theme}
                </span>
              )}
              <span className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1">
                {total > 0 ? `${total} werken` : "Nog geen werken gekoppeld"}
              </span>
              {meta.is_premium != null && (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 border text-xs font-medium ${
                    meta.is_premium
                      ? "border-yellow-500/70 text-yellow-300 bg-yellow-500/5"
                      : "border-emerald-500/70 text-emerald-300 bg-emerald-500/5"
                  }`}
                >
                  {meta.is_premium ? "Premiumtour" : "Gratis tour"}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-right text-gray-400 space-y-1">
            {dateLabel && (
              <p>
                Onderdeel van het dagprogramma van{" "}
                <span className="text-gray-200">{dateLabel}</span>
              </p>
            )}
            <Link
              href="/tour"
              className="inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200"
            >
              ← Terug naar tours van vandaag
            </Link>
          </div>
        </header>

        {/* Intro blokken */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="rounded-2xl border border-gray-800 bg-black/40 p-4 md:p-5">
            <h2 className="text-sm font-semibold mb-2">
              Introductie van deze tour
            </h2>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {meta.detail_intro ??
                meta.overview_intro ??
                "Deze tour neemt u mee langs een reeks kunstwerken die samen een verhaal vertellen. U krijgt per werk een korte toelichting in museale taal."}
            </p>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-800 bg-[#020617] p-4">
              <h3 className="text-xs font-semibold text-gray-200 mb-1">
                Wat u van deze tour kunt verwachten
              </h3>
              <p className="text-xs text-gray-300 whitespace-pre-line">
                {meta.experience_text ??
                  "Ongeveer twintig tot vijfentwintig minuten aandachtig kijken en luisteren. U kunt de tour op eigen tempo volgen en op elk moment pauzeren."}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-[#020617] p-4">
              <h3 className="text-xs font-semibold text-gray-200 mb-1">
                Praktische tips
              </h3>
              <p className="text-xs text-gray-300 whitespace-pre-line">
                {meta.user_hints ??
                  "Kies een rustige plek, zet uw scherm op volledige helderheid en neem af en toe een moment afstand van het scherm om het werk als geheel te bekijken."}
              </p>
            </div>
          </div>
        </section>

        {/* Theatermodus */}
        <section className="mt-2 rounded-3xl border border-gray-800 bg-black/40 p-4 md:p-6 flex flex-col gap-4">
          {/* Voortgang en navigatie */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-700 px-3 py-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {total > 0 ? "Tour actief" : "Tour nog niet gevuld"}
              </span>
              <span className="text-gray-400">Werk {positionLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0 || total === 0}
                className="rounded-full border border-gray-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Vorig werk
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={index >= total - 1 || total === 0}
                className="rounded-full border border-gray-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Volgend werk
              </button>
            </div>
          </div>

          {current ? (
            <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-gray-800">
                {current.image_url ? (
                  <Image
                    src={current.image_url}
                    alt={current.title}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    Geen afbeelding beschikbaar voor dit werk.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                    Werk {index + 1} van {total || 0}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    {current.title}
                  </h2>
                  {(current.artist || current.year) && (
                    <p className="text-xs text-gray-300">
                      {[current.artist, current.year].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line">
                  {current.description ??
                    "Voor dit werk is nog geen uitgebreide toelichting beschikbaar. In een volgende fase wordt deze aangevuld met een museale tekst."}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-700 bg-black/40 px-4 py-6 text-sm text-gray-300">
              Deze tour is nog niet gevuld met kunstwerken. Zodra er werken zijn
              gekoppeld aan deze tour, verschijnt hier de theatermodus met beeld
              en toelichting per werk.
            </div>
          )}
        </section>

        {/* Afsluitblok met rating */}
        <section className="mt-2 grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)] items-start">
          <div className="rounded-2xl border border-gray-800 bg-black/40 p-4 md:p-5">
            <h2 className="text-sm font-semibold mb-2">Afronding van de tour</h2>
            <p className="text-sm text-gray-300 whitespace-pre-line">
              {meta.closing_text ??
                "Dank voor het volgen van deze tour. Neem gerust een moment om na te voelen welke werken het meest zijn blijven hangen, en wat u verrast heeft."}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-[#020617] p-4 md:p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-100">
              Hoe heeft u deze tour ervaren?
            </h3>
            <p className="text-xs text-gray-300">
              Uw beoordeling helpt ons om toekomstige tours beter af te stemmen
              op wat kijkers waarderen. Kies hieronder een waardering.
            </p>
            <div className="mt-1">
              <RatingStars contentType="tour" contentId={meta.id} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
