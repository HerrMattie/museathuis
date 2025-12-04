export const metadata = {
  title: "MuseaThuis Academie",
  description:
    "Voor wie verder wil kijken dan het museumlabel: verdiepende trajecten langs periodes, thema's en kunstenaars.",
};

export default function AcademiePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          MuseaThuis Academie
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Voor wie verder wil kijken dan het museumlabel. De Academie biedt
          trajecten langs periodes, thema&apos;s en kunstenaars, opgebouwd in
          heldere stappen die je in je eigen tempo kunt doorlopen.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-50">Onderwerpen</h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Elk onderwerp kent drie niveaus: een introductieniveau, een
          verdiepingsniveau en een niveau voor liefhebbers die echt de diepte
          in willen.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Hollandse Gouden Eeuw
            </p>
            <h3 className="text-base font-semibold text-slate-50">
              Basis, Verdieping, Meester
            </h3>
            <p className="text-xs text-slate-300">
              Van een eerste overzicht van de schilderkunst tot diepgaande
              trajecten over handel, macht en religie in de 17e eeuw.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Portret en identiteit
            </p>
            <h3 className="text-base font-semibold text-slate-50">
              Basis, Verdieping, Meester
            </h3>
            <p className="text-xs text-slate-300">
              Hoe portretkunst werkt, hoe status wordt verbeeld en hoe
              kunstenaars identiteit door de eeuwen heen vormgeven.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Landschap en licht
            </p>
            <h3 className="text-base font-semibold text-slate-50">
              Basis, Verdieping, Meester
            </h3>
            <p className="text-xs text-slate-300">
              Van de eerste landschappen tot impressionistische en moderne
              benaderingen, met speciale aandacht voor licht en atmosfeer.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Religie en verhalen
            </p>
            <h3 className="text-base font-semibold text-slate-50">
              Basis, Verdieping, Meester
            </h3>
            <p className="text-xs text-slate-300">
              Bijbelverhalen en mythologie in de kunst, en hoe betekenissen
              per periode en land verschuiven.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Moderne en abstracte kunst
            </p>
            <h3 className="text-base font-semibold text-slate-50">
              Basis, Verdieping, Meester
            </h3>
            <p className="text-xs text-slate-300">
              Een traject van eerste kennismaking met abstractie tot een
              diepere oefening in kijken en interpreteren.
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/20 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Binnenkort
            </p>
            <h3 className="text-base font-semibold text-slate-200">
              Nieuwe trajecten
            </h3>
            <p className="text-xs text-slate-400">
              In de toekomst worden nieuwe onderwerpen toegevoegd op basis van
              gebruiksdata en wensen van leden.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          In je eigen tempo
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Je voortgang wordt per leerlijn bijgehouden. Je kunt altijd stoppen
          en later weer verder gaan, zonder druk en zonder deadlines. De
          Academie is onderdeel van het premiumlidmaatschap van MuseaThuis.
        </p>
      </section>
    </div>
  );
}
