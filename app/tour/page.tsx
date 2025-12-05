export default function TourPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Vandaag
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Tour van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Dit is de dagtour zoals die in het dagprogramma is geselecteerd. In een
          volgende fase wordt deze pagina rechtstreeks gekoppeld aan Supabase
          (tours, tour_items, dayprogram_schedule) en worden de werken een voor
          een in theatermodus getoond.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Hoofdroute van vandaag
        </h2>
        <p className="text-xs text-slate-400">
          Elke tour heeft één duidelijke gemeenschappelijke deler: een thema of
          samenhang die door alle werken loopt. Het niveau (1 of 2) geeft de
          diepgang aan, niet of er wel of geen thema aanwezig is.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Gratis dagtour
            </p>
            <h3 className="text-lg font-semibold text-slate-50">
              Voorbeeldtitel dagtour
            </h3>
            <p className="text-xs text-slate-300">
              Voor nu een placeholder. Straks komt hier de echte titel, tourintro
              en de lijst van circa acht werken die in deze route zijn opgenomen.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
              <li>Gemeenschappelijk thema: wordt als veld in de database opgeslagen.</li>
              <li>Niveau 1: toegankelijk, basisuitleg per werk.</li>
              <li>Niveau 2: meer context, vergelijking en interpretatie.</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Volgende stap
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Koppeling aan dagprogramma in Supabase (tabel dayprogram_schedule).</li>
              <li>Gebruik van thema-veld per tour als rode draad in tekst en audio.</li>
              <li>Theaterweergave met navigatie per werk en afronding met rating.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Gelaagdheid: niveau 1 en 2
        </h2>
        <p className="text-xs text-slate-300">
          Het doel is dat élke tour één herkenbaar thema heeft. Het niveau geeft
          alleen de mate van verdieping aan: niveau 1 is introductief, niveau 2
          gaat verder in op context, vergelijking en interpretatie. Beide niveaus
          gebruiken dezelfde thematische kern in alle werken van de tour.
        </p>
      </section>
    </div>
  );
}
