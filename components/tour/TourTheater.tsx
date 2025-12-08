"use client";

import Link from "next/link";
import TourOverlay from "@/components/tour/TourOverlay";

export type TourItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  year_from?: number | null;
  image_url?: string | null;
  description?: string | null;
  artist_name?: string | null;
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

function formatDutchDate(dateString: string | null): string | null {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function TourTheater({ meta, items }: Props) {
  const dateLabel = formatDutchDate(meta.date);
  const durationLabel = meta.durationMin
    ? `Ongeveer ${meta.durationMin} minuten`
    : "Ongeveer twintig minuten";

  const heroSublineParts: string[] = [];
  if (dateLabel) heroSublineParts.push(`Dagtour voor ${dateLabel}`);
  heroSublineParts.push(durationLabel);
  const heroSubline = heroSublineParts.join(" · ");

  return (
    <div className="flex flex-col gap-8">
      {/* HERO HEADER */}
      <section className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Tour
          {meta.isPremium && (
            <span className="ml-2 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">
              Premium
            </span>
          )}
        </div>

        <h1 className="text-3xl font-semibold md:text-4xl">
          {meta.title}
        </h1>

        <p className="text-sm text-muted-foreground">
          {heroSubline}
        </p>

        <div className="mt-2">
          <Link
            href="/tour"
            className="text-sm font-medium text-yellow-300 hover:text-yellow-200 hover:underline"
          >
            ← Terug naar tours van vandaag
          </Link>
        </div>
      </section>

      {/* OVER DEZE TOUR */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Introductie van deze tour
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {meta.detailIntro ||
              "Deze tour neemt u mee langs een reeks kunstwerken die samen een verhaal vertellen, met toelichting in heldere museale taal."}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Wat u van deze tour kunt verwachten
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {meta.overviewIntro ||
                "U volgt de tour in uw eigen tempo. Elk werk verschijnt groot in beeld, met een korte audiotoelichting en begeleidende tekst."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Praktische tips
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {meta.userHints ||
                "Kies een rustige plek, zet uw scherm op volledige helderheid en neem af en toe afstand om het werk als geheel te bekijken."}
            </p>
          </div>
        </div>
      </section>

      {/* UITLEG PREMIUM-ERVARING */}
      <section className="rounded-2xl border border-white/5 bg-white/5 px-5 py-5">
        <h2 className="mb-2 text-sm font-semibold">
          Hoe werkt deze tour?
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          In deze tour beleeft u elk kunstwerk in een rustige theatermodus, met
          beeld, audio en toelichting die speciaal op elkaar zijn afgestemd.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Ongeveer acht kunstwerken per tour.</li>
          <li>Bij elk werk een audiotoelichting en begeleidende tekst.</li>
          <li>
            U kunt elk werk beoordelen, zodat we de best gewaardeerde werken
            terugzien in Best of MuseaThuis.
          </li>
        </ul>
      </section>

      {/* CTA + START TOUR (OVERLAY) */}
      <section className="flex flex-col items-center gap-3 pb-4 pt-2">
        <p className="text-sm text-muted-foreground">
          Klaar om de tour te starten?
        </p>

        <TourOverlay
          tourTitle={meta.title}
          items={items}
          contentType="tour"
          contentId={meta.id}
        />

        <Link
          href="/tour"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Liever een andere tour van vandaag kiezen
        </Link>
      </section>
    </div>
  );
}
