import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-10 space-y-12">
      {/* Hero */}
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Digitaal museum voor thuis
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Elke dag een nieuwe kunsttour, gewoon vanuit huis.
          </h1>
          <p className="text-base text-neutral-700">
            MuseaThuis geeft je dagelijks een zorgvuldig samengestelde tour met
            ongeveer drie minuten audio per kunstwerk. Rustig, verdiepend en
            zonder drempels.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tour"
              className="rounded-full bg-[#5b7fba] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Start tour van vandaag
            </Link>
            <Link
              href="/premium"
              className="rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Ontdek Premium
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700 space-y-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Vandaag in de tour
          </p>
          <p>
            Een thematische route langs een aantal werken uit verschillende musea.
            Met context over kunstenaar, tijd en techniek. Ideaal voor een rustig
            moment aan het einde van de dag.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Circa 15 tot 20 minuten totale luistertijd</li>
            <li>Korte vragen om bewuster te kijken</li>
            <li>Direct beschikbaar, geen inlog verplicht</li>
          </ul>
          <p className="text-xs text-neutral-500">
            Later wordt dit blok gevuld met echte gegevens uit de planning.
          </p>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Hoe MuseaThuis werkt</h2>
        <div className="grid gap-6 md:grid-cols-3 text-sm text-neutral-700">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Dagelijkse tour</h3>
            <p>
              Elke dag een nieuwe route langs kunstwerken rond een thema, periode
              of vraag. Je hoeft niets samen te stellen, alleen te starten.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Verhalen met audio</h3>
            <p>
              Per kunstwerk luister je ongeveer drie minuten naar een rustig
              opgebouwd verhaal dat verder gaat dan het bordje in de zaal.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. Lichte spelelementen</h3>
            <p>
              Kleine vragen, badges en rankings maken het aantrekkelijk om
              terug te komen, zonder dat de inhoud naar de achtergrond verdwijnt.
            </p>
          </div>
        </div>
      </section>

      {/* Premium teaser */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8 space-y-4">
        <h2 className="text-xl font-semibold">Meer halen uit je museumtijd</h2>
        <p className="text-sm text-neutral-700">
          Met MuseaThuis Premium krijg je extra tours, extra spelvormen en
          verdiepende focus sessies op losse kunstwerken. Ideaal als je een
          vaste kunstroutine wilt opbouwen.
        </p>
        <Link
          href="/premium"
          className="inline-flex rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Lees meer over Premium
        </Link>
      </section>

      {/* Voor musea */}
      <section className="space-y-3 pb-6">
        <h2 className="text-xl font-semibold">Voor musea en collecties</h2>
        <p className="text-sm text-neutral-700 max-w-2xl">
          MuseaThuis is een digitale brug naar uw zalen. We vergroten de
          zichtbaarheid van collecties, bereiden bezoekers voor en bieden op
          termijn geanonimiseerde inzichten in interessepatronen.
        </p>
        <Link
          href="/museums"
          className="inline-flex text-sm font-medium text-[#5b7fba] hover:underline"
        >
          Meer over samenwerking
        </Link>
      </section>
    </div>
  );
}
