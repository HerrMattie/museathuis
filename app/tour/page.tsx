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
          volgende fase koppelen we deze pagina rechtstreeks aan Supabase
          (tours, tour_items, dayprogram_schedule) en tonen we de werken één voor
          één in theatermodus met tekst en audio.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Gratis dagtour
          </p>
          <h2 className="text-lg font-semibold text-slate-50">
            Voorbeeldtitel dagtour
          </h2>
          <p className="text-xs text-slate-300">
            Placeholder voor de tour van vandaag. Straks komt hier de echte titel,
            tourintroductie en de lijst van circa acht werken met een duidelijke
            thematische rode draad.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
            <li>Één herkenbaar thema per tour (primary_theme in de database).</li>
            <li>Niveau 1 en 2 gebruiken hetzelfde thema, met verschillende diepgang.</li>
            <li>Na afloop kan de gebruiker deze tour waarderen (alleen met profiel).</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium tour 1
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Verdieping binnen hetzelfde thema
            </h3>
            <p className="text-xs text-slate-300">
              In een latere fase worden hier automatisch twee premiumtours
              getoond die aansluiten bij het thema en niveau van de dagtour.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium tour 2
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Alternatieve route met nieuw accent
            </h3>
            <p className="text-xs text-slate-300">
              Ook deze kaart wordt straks gevuld op basis van het dagprogramma en
              gebruikersprofiel, met behoud van één thematische kern.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Gelaagdheid en waardering
        </h2>
        <p className="text-xs text-slate-300">
          Elke tour heeft één gemeenschappelijke deler. Het niveau geeft alleen
          de mate van verdieping aan: niveau 1 is kennismaking, niveau 2 biedt
          meer context en vergelijking. Na afloop kan de gebruiker de tour
          waarderen; ratings worden op de achtergrond gebruikt voor de selectie
          in “Best of MuseaThuis”.
        </p>
      </section>
    </div>
  );
}
