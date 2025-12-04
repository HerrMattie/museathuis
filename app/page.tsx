import Link from "next/link";

type TodayCardProps = {
  title: string;
  description: string;
  href: string;
  label: string;
};

function TodayCard({ title, description, href, label }: TodayCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-500 hover:bg-slate-900"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-200">
        Bekijk &rarr;
      </p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Vandaag bij MuseaThuis
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Eén digitale dagkaart met een tour, een spel en een focuswerk. Alles
          zorgvuldig samengesteld uit topmusea wereldwijd, voor een hoogwaardige
          kunstbeleving thuis.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <TodayCard
          title="Tour van vandaag"
          description="Een korte museale rondleiding langs een aantal meesterwerken, met uitleg in ongeveer drie minuten per werk."
          href="/tour/today"
          label="Tour"
        />
        <TodayCard
          title="Spel van vandaag"
          description="Speel een kunstquiz of herkenningsspel op basis van werken uit de collectie. Licht en speels, met serieuze inhoud."
          href="/game"
          label="Game"
        />
        <TodayCard
          title="Focus van vandaag"
          description="Eén kunstwerk in theatermodus, met meer tijd voor kijken, luisteren en reflectie. Ideaal voor een rustig kijkmoment."
          href="/focus"
          label="Focus"
        />
      </section>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-50">
            Het beste van MuseaThuis
          </h2>
          <p className="max-w-2xl text-sm text-slate-300">
            Ontdek de hoogst gewaardeerde tours, games en focusmomenten van
            onze leden. Deze selectie is beschikbaar voor premiumleden.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/premium?view=week"
            className="group flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-500 hover:bg-slate-950"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Selectie
              </p>
              <h3 className="text-lg font-semibold text-slate-50">
                Beste van de week
              </h3>
              <p className="text-sm text-slate-300">
                De meest bekeken en best beoordeelde dagkaart van deze week:
                tour, game en focus in één avondprogramma.
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
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Selectie
              </p>
              <h3 className="text-lg font-semibold text-slate-50">
                Beste van de maand
              </h3>
              <p className="text-sm text-slate-300">
                Een langere avondtour met een thematische selectie uit de beste
                MuseaThuis-programma&apos;s van deze maand.
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-200">
              Naar maandselectie &rarr;
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
