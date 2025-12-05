export default function GamePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Vandaag
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Spel van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Dit is het spel dat vandaag centraal staat. In een volgende fase wordt
          deze pagina gekoppeld aan Supabase (games, game_items,
          dayprogram_schedule) en speelt u een echt spel rond concrete werken.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Gratis spel
          </p>
          <h2 className="text-lg font-semibold text-slate-50">
            Voorbeeldtitel spel
          </h2>
          <p className="text-xs text-slate-300">
            Placeholder voor het gratis spel van vandaag. Straks verschijnt hier
            het echte speltype (bijvoorbeeld “welk werk hoort bij deze
            beschrijving?”) gekoppeld aan een selectie van kunstwerken.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
            <li>Altijd gekoppeld aan concrete artworks uit de database.</li>
            <li>Moeilijkheidsgraad sluit aan bij het niveau van de dagtour.</li>
            <li>Score en deelname tellen mee voor badges en “Best of”.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium spel 1
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Verdiepend spel bij het dagthema
            </h3>
            <p className="text-xs text-slate-300">
              Hier komt straks een premiumspel dat inhoudelijk aansluit bij de
              dagtour en extra lagen toevoegt voor ervaren gebruikers.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium spel 2
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Alternatieve uitdaging
            </h3>
            <p className="text-xs text-slate-300">
              Deze kaart is gereserveerd voor een tweede premiumspel, zodat er
              dagelijks maximaal twee betaalde spelopties naast het gratis spel
              bestaan.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Spelervaring en badges
        </h2>
        <p className="text-xs text-slate-300">
          Spelresultaten worden straks vastgelegd in de database. Daarmee kan
          MuseaThuis inzicht geven in betrokkenheid, kennisopbouw en badges
          toekennen voor actieve spelers. De opzet sluit één op één aan bij de
          structuur van de tours en focusmomenten.
        </p>
      </section>
    </div>
  );
}
