import { PrimaryButton } from "@/components/common/PrimaryButton";

export default function PremiumPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">MuseaThuis Premium</h1>
        <p className="text-sm text-slate-300">
          Met MuseaThuis Premium krijg je toegang tot het volledige dagprogramma,
          de Academie en uitgebreide Salonpresentaties. Ontworpen voor kunstliefhebbers
          die structureel willen verdiepen.
        </p>
      </header>

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
              Maak een gratis account aan
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
