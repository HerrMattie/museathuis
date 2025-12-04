export const metadata = {
  title: "Salon",
  description:
    "Maak van elk scherm een kunstwerk met rustige kunstpresentaties die passen bij de sfeer van het moment.",
};

const curatedSalons = [
  {
    title: "Rijksmuseum-sfeer",
    description:
      "Een selectie schilderijen uit het Rijksmuseum met een rustige, klassieke sfeer.",
  },
  {
    title: "Louvre-sfeer",
    description:
      "Hoogtepunten uit het Louvre, gericht op iconische werken en verhalen.",
  },
  {
    title: "Hollandse meesters",
    description:
      "Een reeks werken van Hollandse meesters uit verschillende collecties.",
  },
  {
    title: "17e eeuw",
    description:
      "Een tijdreis door de 17e eeuw, met aandacht voor licht, stofuitdrukking en compositie.",
  },
  {
    title: "Rustige kleuren en stilte",
    description:
      "Kunstwerken met zachte kleuren en een ingetogen sfeer, ideaal voor een rustige achtergrond.",
  },
];

export default function SalonPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-amber-500/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          Alleen voor premiumleden
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Salon
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Met Salon maak je van elk scherm een kunstwerk. Kies een sfeer en
          laat een reeks kunstwerken rustig voorbij komen, met minimale
          bediening. Geschikt voor een rustig moment, een etentje of als
          achtergrond bij een gesprek.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-50">
          Voorgestelde presentaties
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke week selecteert MuseaThuis een aantal Salon-presentaties. Deze
          combinaties worden automatisch ververst op basis van nieuwe suggesties
          en gebruiksdata.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {curatedSalons.map((salon) => (
            <div
              key={salon.title}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            >
              <div className="space-y-2">
                <div className="mb-2 h-24 rounded-lg bg-slate-800" />
                <h3 className="text-base font-semibold text-slate-50">
                  {salon.title}
                </h3>
                <p className="text-xs text-slate-300">{salon.description}</p>
              </div>
              <button className="mt-4 inline-flex text-xs font-medium text-amber-300 hover:text-amber-200">
                Start presentatie
              </button>
            </div>
          ))}

          <div className="flex flex-col justify-between rounded-xl border border-dashed border-slate-700 bg-slate-900/20 p-4">
            <div className="space-y-2">
              <div className="mb-2 h-24 rounded-lg border border-slate-700 bg-slate-900/40" />
              <h3 className="text-base font-semibold text-slate-50">
                Stel je eigen Salon samen
              </h3>
              <p className="text-xs text-slate-300">
                Filter op sfeer, kleur, periode, land en onderwerp. MuseaThuis
                laat zien hoeveel werken passen binnen je selectie, zodat je
                stap voor stap toewerkt naar een passende presentatie.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-400">
                <li>Sfeer: rustig, energiek, contemplatief, feestelijk</li>
                <li>Kleur: warm, koel, hoog contrast, zachte tinten</li>
                <li>Periode: 15e t/m 21e eeuw</li>
                <li>Land: Nederland, Frankrijk, Italië en meer</li>
                <li>Onderwerp: portret, landschap, stilleven, architectuur</li>
                <li>Weergaveduur per werk: 15, 30, 60 of 120 seconden</li>
              </ul>
            </div>
            <button className="mt-4 inline-flex text-xs font-medium text-amber-300 hover:text-amber-200">
              Start eigen Salon &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
