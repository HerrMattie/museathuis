"use client";

import { useState } from "react";
import TourOverlay from "@/components/tour/TourOverlay";

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

export type TourItem = {
  id: string;
  title?: string;
  image_url?: string | null;
  year_from?: number | null;
  dating_text?: string | null;
  text?: string | null;
  description?: string | null;
  audio_url?: string | null;
};

type Props = {
  meta: TourMeta;
  items: TourItem[];
};

export default function TourTheater({ meta, items }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleStartTour = () => {
    if (!items || items.length === 0) return;
    setOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
  };

  return (
    <>
      {/* Detailpagina met uitleg en CTA */}
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Titelblok */}
        <div className="flex flex-col gap-2">
          <div className="text-xs uppercase tracking-[0.16em] text-amber-300">
            Tour {meta.isPremium ? "· Premium" : ""}
          </div>
          <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-400 sm:text-sm">
            Dagtour voor{" "}
            {meta.date
              ? new Date(meta.date).toLocaleDateString("nl-NL", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "vandaag"}
            {meta.durationMin ? ` · Ongeveer ${meta.durationMin} minuten` : ""}
          </p>
        </div>

        {/* Intro en verwachtingen */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-900/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Introductie van deze tour
            </div>
            <p className="mt-2 text-sm text-slate-100">
              {meta.detailIntro ??
                meta.overviewIntro ??
                "Deze tour neemt u mee langs een reeks kunstwerken die samen een verhaal vertellen."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Wat u van deze tour kunt verwachten
              </div>
              <p className="mt-2 text-sm text-slate-100">
                {meta.experienceText ??
                  "U volgt de tour in uw eigen tempo. Elk werk verschijnt groot in beeld, met een korte audiotoelichting en begeleidende tekst."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900/60 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Praktische tips
              </div>
              <p className="mt-2 text-sm text-slate-100">
                {meta.userHints ??
                  "Kies een rustige plek, zet uw scherm op volledige helderheid en neem af en toe afstand van het scherm om het werk als geheel te bekijken."}
              </p>
            </div>
          </div>
        </div>

        {/* Hoe werkt deze tour */}
        <div className="rounded-xl bg-slate-900/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Hoe werkt deze tour
          </div>
          <div className="mt-2 text-sm text-slate-100">
            <p className="mb-2">
              In deze tour beleeft u elk kunstwerk in een rustige theatermodus,
              met beeld, audio en toelichting die op elkaar zijn afgestemd.
            </p>
            <ul className="ml-5 list-disc space-y-1 text-slate-100">
              <li>Ongeveer acht kunstwerken per tour.</li>
              <li>Bij elk werk een audiotoelichting en begeleidende tekst.</li>
              <li>
                U kunt elk werk beoordelen. De best gewaardeerde werken komen
                terug in Best of MuseaThuis.
              </li>
            </ul>
          </div>
        </div>

        {/* CTA: start tour */}
        <div className="mt-8 flex flex-col items-center gap-3 pb-4">
          <p className="text-sm text-slate-300">Klaar om de tour te starten?</p>
          <button
            type="button"
            onClick={handleStartTour}
            className="rounded-full bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Start tour
          </button>
          <button
            type="button"
            className="text-xs text-slate-400 underline-offset-2 hover:underline"
          >
            Liever een andere tour van vandaag kiezen
          </button>
        </div>
      </div>

      {/* Overlay: alleen open na klik op Start tour */}
      <TourOverlay
        tourTitle={meta.title}
        items={items}
        contentType="tour"
        contentId={meta.id}
        open={overlayOpen}
        onClose={handleCloseOverlay}
      />
    </>
  );
}
