import { PrimaryButton } from "@/components/common/PrimaryButton";

export default function PremiumPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">MuseaThuis Premium</h1>
        <p className="text-sm text-slate-300">
          Met MuseaThuis Premium krijgt u toegang tot het volledige dagprogramma,
          de Academie en uitgebreide Salonpresentaties. Meer verdieping voor u, meer
          inzicht voor musea.
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="mb-2 text-base font-semibold">Gratis profiel versus Premium</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-2 pr-4"></th>
                <th className="py-2 pr-4 font-semibold text-slate-200">Gratis profiel</th>
                <th className="py-2 pr-4 font-semibold text-amber-300">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800">
                <td className="py-2 pr-4">Dagelijkse tours</td>
                <td className="py-2 pr-4">1 gratis tour</td>
                <td className="py-2 pr-4">Alle tours van de dag</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2 pr-4">Dagelijkse spellen</td>
                <td className="py-2 pr-4">1 gratis spel</td>
                <td className="py-2 pr-4">Alle spellen van de dag</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2 pr-4">Focusmomenten</td>
                <td className="py-2 pr-4">1 gratis focusmoment</td>
                <td className="py-2 pr-4">Meerdere focusmomenten per dag</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2 pr-4">Academie</td>
                <td className="py-2 pr-4">Introductietraject</td>
                <td className="py-2 pr-4">Alle Academie-trajecten</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2 pr-4">Salonpresentaties</td>
                <td className="py-2 pr-4">Voorproef Salon</td>
                <td className="py-2 pr-4">Volledige Salonsets</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Inzichten en badges</td>
                <td className="py-2 pr-4">Basisoverzicht gebruik</td>
                <td className="py-2 pr-4">Uitgebreid overzicht en badges</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-base font-semibold">Wat is inbegrepen</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Alle tours van de dag, inclusief verdiepende routes.</li>
            <li>Drie spellen per dag met uiteenlopende spelvormen.</li>
            <li>Meerdere focusmomenten per dag met audio.</li>
            <li>Volledige toegang tot de MuseaThuis Academie.</li>
            <li>Uitgebreide Salonpresentaties voor televisie of groot scherm.</li>
            <li>Persoonlijke suggesties op basis van profiel en gebruik.</li>
          </ul>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-base font-semibold">Prijs en voorwaarden</h2>
          <p className="text-sm text-slate-300">
            MuseaThuis Premium kost{" "}
            <span className="font-semibold text-amber-300">7,99 euro per maand</span>.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Maandelijks opzegbaar.</li>
            <li>Geen opstart- of verborgen kosten.</li>
            <li>
              In de introductiefase hanteren wij een tijdelijk lager tarief. Dit
              communiceren wij zodra Premium live gaat.
            </li>
          </ul>
          <div>
            <PrimaryButton className="w-full">
              Maak een gratis profiel aan
            </PrimaryButton>
            <p className="mt-2 text-xs text-slate-400">
              Het betaalproces wordt in een volgende fase toegevoegd. Op dit moment
              kunt u alvast een gratis profiel aanmaken.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="mb-1 text-base font-semibold">Data en privacy</h2>
        <p>
          MuseaThuis gebruikt waarderingen en gebruiksgegevens om het aanbod te
          verbeteren en in geanonimiseerde vorm inzichten met musea te delen. Er
          worden geen individuele profielen met derden gedeeld en gegevens worden
          alleen op geaggregeerd niveau gerapporteerd.
        </p>
      </section>
    </div>
  );
}
