"use client";

export default function SalonPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Vandaag
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Salonpresentaties
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          De salonmodus is bedoeld voor schermvullende presentaties van kunstwerken
          per sfeer of thema. Eén gratis set per dag, twee premiumsets voor
          abonnees. In een volgende fase koppelen we deze pagina aan de tabellen
          <span className="font-mono"> salon_sets</span> en
          <span className="font-mono"> salon_set_items</span>.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Gratis salon
          </p>
          <h2 className="text-lg font-semibold text-slate-50">
            Voorbeeldtitel salonset
          </h2>
          <p className="text-xs text-slate-300">
            Placeholder voor de gratis salon van vandaag. Straks wordt hier een
            reeks werken uit de database getoond in fullscreen modus, met minimale
            tekst en rustige overgangen.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
            <li>Eén sfeer of thema per set, herkenbaar benoemd.</li>
            <li>Voor gebruik op televisie of groot scherm.</li>
            <li>Basiskeuze komt uit het dagprogramma, maar is later ook los te starten.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium salon 1
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Verdiepende sfeerselectie
            </h3>
            <p className="text-xs text-slate-300">
              Deze kaart is gereserveerd voor een premium salonset die inhoudelijk
              aansluit bij het dagthema of een specifiek museum.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium salon 2
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Alternatieve sfeer of collectie
            </h3>
            <p className="text-xs text-slate-300">
              Hier verschijnt straks een tweede premiumset, bijvoorbeeld een
              collectie rond één kunstenaar of museum, op basis van dezelfde
              salonstructuur.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Salonmodus als vierde pijler
        </h2>
        <p className="text-xs text-slate-300">
          Salonsets worden straks net als tours en focusmomenten via het
          dagprogramma geactiveerd. In de backend werken we met vaste sets,
          gekoppeld aan artworks, waarbij de weergave vooral draait om ritme,
          sfeer en afwisseling.
        </p>
      </section>
    </div>
  );
}
