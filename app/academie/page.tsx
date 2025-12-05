"use client";

export default function AcademiePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Leerlijnen
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          MuseaThuis Academie
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          De Academie wordt de plek voor gestructureerde leerlijnen, vergelijkbaar
          met platforms als GoodHabitz: korte modules, duidelijke niveaus en
          voortgang per gebruiker. Deze pagina richt de basisstructuur in voor
          cursuscatalogus, leerlijnen en voortgangsoverzicht.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-base font-semibold text-slate-50">
            Aanbevolen leerlijnen
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Niveau 1
              </p>
              <h3 className="text-sm font-semibold text-slate-50">
                Kennismaken met meesterwerken
              </h3>
              <p className="text-xs text-slate-300">
                In acht modules maakt de gebruiker kennis met iconische werken uit
                verschillende musea. Ideaal als startniveau.
              </p>
              <p className="text-[11px] text-slate-400">
                8 modules · circa 60 minuten totaal
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Niveau 2
              </p>
              <h3 className="text-sm font-semibold text-slate-50">
                Verdieping per museum
              </h3>
              <p className="text-xs text-slate-300">
                Leerlijn rond één museum per keer, met koppeling aan tours,
                focusmomenten en salonsets in het dagprogramma.
              </p>
              <p className="text-[11px] text-slate-400">
                10 modules · circa 90 minuten totaal
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-base font-semibold text-slate-50">
            Jouw voortgang
          </h2>
          <p className="text-xs text-slate-300">
            In een volgende fase wordt dit blok gekoppeld aan
            <span className="font-mono"> user_profiles</span>,
            <span className="font-mono"> badges</span> en een aparte
            voortgangstabel. Hier ziet de gebruiker welke leerlijnen gestart zijn,
            hoeveel modules zijn afgerond en welke badges zijn behaald.
          </p>
          <div className="mt-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-3 text-[11px] text-slate-400">
            Placeholder voortgangsweergave
          </div>
        </aside>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Catalogus van modules
        </h2>
        <p className="text-xs text-slate-300">
          De volledige catalogus wordt straks gevuld vanuit een aparte
          Academie-datalaag (bijvoorbeeld tabel
          <span className="font-mono"> academy_tracks</span> en
          <span className="font-mono"> academy_modules</span>). Hier komen filters
          op thema, museum, niveau en duur, vergelijkbaar met moderne
          e-learningplatforms.
        </p>
      </section>
    </div>
  );
}
