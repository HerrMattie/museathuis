export default function FocusPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Vandaag
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Focusmoment van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Een focusmoment is een korte, geconcentreerde ontmoeting met één
          kunstwerk. In een volgende fase koppelen we deze pagina aan Supabase
          (focus_items, artworks, dayprogram_schedule) en tonen we beeld, tekst
          en audio in een rustige theatermodus.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Gratis focusmoment
          </p>
          <h2 className="text-lg font-semibold text-slate-50">
            Voorbeeldtitel focusmoment
          </h2>
          <p className="text-xs text-slate-300">
            Placeholder voor het gratis focusmoment van vandaag. Straks wordt hier
            één kunstwerk uitgelicht met tekst en zoommogelijkheden, passend bij
            het dagthema.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
            <li>Eén kunstwerk centraal, ongeveer tien minuten verstilling.</li>
            <li>Tekst en audio sluiten aan bij hetzelfde thema als de dagtour.</li>
            <li>Met profiel kan de gebruiker dit focusmoment waarderen.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium focus 1
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Verdiepend focusmoment
            </h3>
            <p className="text-xs text-slate-300">
              Hier komt straks een premium focusmoment, bijvoorbeeld een tweede
              werk binnen hetzelfde thema met extra context of vergelijking.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Premium focus 2
            </p>
            <h3 className="text-sm font-semibold text-slate-50">
              Alternatieve invalshoek
            </h3>
            <p className="text-xs text-slate-300">
              Dit blok is bedoeld voor een tweede premium focusmoment zodat er
              dagelijks één gratis en twee betaalde verdiepingservaringen mogelijk
              zijn.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Focus als pijler van MuseaThuis
        </h2>
        <p className="text-xs text-slate-300">
          Focusmomenten vormen samen met tours en spellen de kern van de
          dagelijks ervaring op MuseaThuis. Backendmatig sluiten ze aan op dezelfde
          structuur: één record per focusmoment, gekoppeld aan artworks, ratings
          en dagprogramma, zodat data-analyses museumpartners inzicht geven in
          diepgang en waardering.
        </p>
      </section>
    </div>
  );
}
