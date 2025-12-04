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
          kunstenaars. Elke leerlijn bestaat uit een reeks tours en
          focusmomenten met een duidelijke opbouw. Jij bepaalt het tempo; wij
          zorgen voor structuur en samenhang.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Avondprogramma&apos;s en weekenden
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke maand is er een live-avond en elk weekend een langer
          avondprogramma rond een museum of thema. Deze programma&apos;s
          combineren tours, spel en focus tot één geheel, zodat je een complete
          museumavond thuis kunt beleven.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Alleen voor premiumleden
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          De Academie is onderdeel van het premiumlidmaatschap van MuseaThuis.
          Als premiumlid krijg je toegang tot alle leerlijnen, avondprogramma&apos;s
          en toekomstige verdiepende modules.
        </p>
      </section>
    </div>
  );
}
