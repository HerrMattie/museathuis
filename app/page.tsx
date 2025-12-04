import Link from "next/link";

type TodayCardProps = {
  title: string;
  description: string;
  href: string;
  label: string;
  imageHint: string;
};

function TodayCard({ title, description, href, label, imageHint }: TodayCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-500 hover:bg-slate-900"
    >
      <div className="flex gap-4">
        <div className="hidden h-24 w-20 flex-none overflow-hidden rounded-lg bg-slate-800 sm:block">
          <div className="flex h-full w-full items-center justify-center px-2 text-[11px] text-slate-300">
            {imageHint}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-200">
        Bekijk &rarr;
      </p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
          MuseaThuis: museale beleving thuis
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          MuseaThuis is een hoogwaardige culturele omgeving voor thuis. Elke dag
          kun je kiezen uit nieuwe tours, spellen en rustige kijkmomenten,
          samengesteld uit topmusea wereldwijd.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <TodayCard
          title="Tours van vandaag"
          description="Kies uit drie zorgvuldig samengestelde tours. Eén tour is gratis toegankelijk, twee zijn beschikbaar voor premiumleden."
          href="/tour/today"
          label="Tours"
          imageHint="Afbeelding uit de gratis tour van vandaag."
        />
        <TodayCard
          title="Spellen van vandaag"
          description="Ontdek drie kunstspellen. Luchtig spelen met serieuze inhoud, op basis van geselecteerde kunstwerken."
          href="/game"
          label="Spellen"
          imageHint="Afbeelding uit het gratis spel van vandaag."
        />
        <TodayCard
          title="Focusmomenten van vandaag"
          description="Drie rustige kijkmomenten met één kunstwerk centraal, inclusief verdiepende toelichting en audio."
          href="/focus"
          label="Focus"
          imageHint="Afbeelding van het gratis focuswerk van vandaag."
        />
      </section>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-50">
            Het beste van MuseaThuis
          </h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Ontdek welke tours, spellen en focusmomenten het hoogst worden
            gewaardeerd door onze leden. Deze selecties zijn beschikbaar voor
            premiumleden.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/premium?view=week"
            className="group flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-500 hover:bg-slate-950"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Selectie
                </p>
                <span className="rounded-full border border-amber-500/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  Premium
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-50">
                Het beste van deze week
              </h3>
              <p className="text-sm text-slate-300">
                Een selectie van de hoogst gewaardeerde tours, spellen en
                focusmomenten van de afgelopen week.
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-200">
              Naar weekselectie &rarr;
            </p>
          </Link>

          <Link
            href="/premium?view=month"
            className="group flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-500 hover:bg-slate-950"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Selectie
                </p>
                <span className="rounded-full border border-amber-500/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  Premium
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-50">
                Het beste van deze maand
              </h3>
              <p className="text-sm text-slate-300">
                De meest geliefde MuseaThuis-programma&apos;s van deze maand,
                gebundeld in één selectie.
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-200">
              Naar maandselectie &rarr;
            </p>
          </Link>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-2xl font-semibold text-slate-50">
          Maak van elk scherm een kunstwerk
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Met Salon verandert elk scherm in een rustige kunstpresentatie. Kies
          een sfeer en laat een reeks kunstwerken in je eigen tempo voorbij
          komen, thuis op de bank of tijdens een etentje.
        </p>
        <Link
          href="/salon"
          className="inline-flex text-sm font-medium text-amber-300 hover:text-amber-200"
        >
          Ontdek Salon &rarr;
        </Link>
      </section>
    </>
  );
}
