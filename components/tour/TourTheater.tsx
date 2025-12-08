"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RatingStars from "@/components/rating/RatingStars";

export type TourItem = {
  id: string;
  title: string;
  text?: string | null;
  image_url?: string | null;
};

export type TourMeta = {
  id: string;
  date: string | null;
  title: string;
  intro: string | null;
  isPremium: boolean;
  status: string | null;
  theme: string | null;
  subtitle: string | null;
  shortDescription: string | null;
  durationMin: number | null;
  experienceText: string | null;
  closingText: string | null;
  overviewIntro: string | null;
  detailIntro: string | null;
  userHints: string | null;
};

type Props = {
  meta: TourMeta;
  items: TourItem[];
};

export default function TourTheater({ meta, items }: Props) {
  const [index, setIndex] = useState(0);

  const safeItems = useMemo(() => items ?? [], [items]);
  const total = safeItems.length;
  const current = total > 0 ? safeItems[Math.min(index, total - 1)] : null;

  const workLabel =
    total === 0 ? "Werk 0 / 0" : `Werk ${Math.min(index + 1, total)} / ${total}`;

  function handlePrev() {
    if (total === 0) return;
    setIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  }

  function handleNext() {
    if (total === 0) return;
    setIndex((prev) => (prev >= total - 1 ? total - 1 : prev + 1));
  }

  const recommendedMinutes = meta.durationMin ?? 20;

  return (
    <>
      <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-yellow-400">
          <span>Tour</span>
          {meta.isPremium && (
            <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-300">
              Premium
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold text-slate-50">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-sm text-slate-300">{meta.subtitle}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {meta.date && (
            <span>
              Dagtour voor{" "}
              {new Date(meta.date).toLocaleDateString("nl-NL", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          <span>Ongeveer {recommendedMinutes} minuten</span>
          {meta.theme && <span>Thema: {meta.theme}</span>}
        </div>
        <div className="mt-3 text-xs">
          <Link
            href="/tour"
            className="text-yellow-300 hover:text-yellow-200 underline-offset-2 hover:underline"
          >
            ← Terug naar tours van vandaag
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Introductie van deze tour
          </h2>
          <p className="text-sm leading-relaxed text-slate-200">
            {meta.detailIntro ||
              meta.overviewIntro ||
              meta.intro ||
              "Deze tour neemt u mee langs een reeks kunstwerken die samen een verhaal vertellen. U krijgt per werk een korte toelichting in museale taal."}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Wat u van deze tour kunt verwachten
            </h2>
            <p className="text-sm leading-relaxed text-slate-200">
              {meta.experienceText ||
                "Ongeveer twintig tot vijfentwintig minuten aandachtig kijken en luisteren. U kunt de tour in eigen tempo volgen en op elk moment pauzeren."}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Praktische tips
            </h2>
            <p className="text-sm leading-relaxed text-slate-200">
              {meta.userHints ||
                "Kies een rustige plek, zet uw scherm op volledige helderheid en neem af en toe afstand van het scherm om het werk als geheel te bekijken."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${
                total > 0 ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>
              {total > 0 ? "Tour gevuld" : "Tour nog niet gevuld"}
            </span>
            <span className="text-slate-500">•</span>
            <span>{workLabel}</span>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={total === 0 || index === 0}
              className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Vorig werk
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={total === 0 || index >= total - 1}
              className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Volgend werk
            </button>
          </div>
        </div>

        {total === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm leading-relaxed text-slate-300">
            Deze tour is nog niet gevuld met kunstwerken. Zodra er werken zijn
            gekoppeld aan deze tour, verschijnt hier de theatermodus met beeld
            en toelichting per werk.
          </div>
        )}

        {total > 0 && current && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black/60">
              {current.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current.image_url}
                  alt={current.title}
                  className="h-full w-full max-h-[520px] object-contain"
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">
                  Geen afbeelding beschikbaar voor dit werk.
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-50">
                  {current.title || "Kunstwerk"}
                </h3>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-relaxed text-slate-200">
                {current.text ||
                  "Toelichting bij dit werk volgt. In de definitieve versie krijgt u hier een korte museale beschrijving, context en enkele observaties om op te letten."}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Afronding van de tour
          </h2>
          <p className="text-sm leading-relaxed text-slate-200">
            {meta.closingText ||
              "Dank voor het volgen van deze tour. Neem gerust een moment om na te voelen welke werken het meest zijn blijven hangen, en wat u verrast heeft."}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Hoe heeft u deze tour ervaren?
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-slate-200">
            Uw beoordeling helpt ons om toekomstige tours beter af te stemmen op
            wat kijkers waarderen. Kies hieronder een waardering.
          </p>
          <RatingStars contentType="tour" contentId={meta.id} />
        </div>
      </section>
    </>
  );
}
