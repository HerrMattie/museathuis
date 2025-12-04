export const metadata = {
  title: "MuseaThuis Academie",
  description:
    "Verdiepende leerlijnen en avondprogramma's voor kunstliefhebbers die structureel meer willen leren, zonder schoolgevoel.",
};

export default function AcademiePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          MuseaThuis Academie
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          De Academie is de verdiepende laag van MuseaThuis. Geen klassikaal
          onderwijs, maar zorgvuldig samengestelde trajecten langs topmusea,
          waarin kijken, luisteren en begrijpen centraal staan.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Leerlijnen en trajecten
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Binnen de Academie vind je leerlijnen rond periodes, thema&apos;s en
          kunstenaars. Elke leerlijn bestaat uit een reeks tours en focus-
          sessies, met een duidelijke opbouw in moeilijkheidsgraad. Jij bepaalt
          het tempo; wij zorgen voor structuur.
        </p>
        <p className="text-sm text-slate-400">
          Deze pagina kan straks gevoed worden vanuit de tabellen{" "}
          <code>learning_tracks</code> en{" "}
          <code>learning_track_items</code>, inclusief een indicatie van de
          totale duur per traject.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Avondprogramma&apos;s en weekenden
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke maand is er een live-avond, en elk weekend een langer
          avondprogramma rond een museum of thema. Deze programma&apos;s
          combineren tours, spel en focus tot één coherent geheel.
        </p>
        <p className="text-sm text-slate-400">
          De koppeling naar deze programma&apos;s kan verlopen via{" "}
          <code>evening_programs</code> en <code>live_events</code>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Alleen voor premiumleden
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          De Academie is onderdeel van het premiumlidmaatschap van MuseaThuis.
          Hier voeg je later de logica toe om alleen gebruikers met een actief
          abonnement toegang te geven.
        </p>
      </section>
    </div>
  );
}
