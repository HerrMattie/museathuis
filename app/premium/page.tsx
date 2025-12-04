export const metadata = {
  title: "MuseaThuis Premium",
  description:
    "Premiumlidmaatschap voor kunstliefhebbers die vaker en dieper thuis musea willen beleven.",
};

export default function PremiumPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          MuseaThuis Premium
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Als premiumlid krijg je elke dag toegang tot alle tours, games en
          focusmomenten, plus extra avondprogramma&apos;s, de MuseaThuis
          Academie en exclusieve salonsets.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Wat je krijgt als premiumlid
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Volledige toegang tot alle dagelijkse tours, games en focus.</li>
          <li>Toegang tot de MuseaThuis Academie met leerlijnen en trajecten.</li>
          <li>Maandelijkse live-avond en uitgebreide weekendprogramma&apos;s.</li>
          <li>Curated salons en de mogelijkheid eigen salons samen te stellen.</li>
          <li>Persoonlijke tours op basis van jouw voorkeuren en filters.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Lidmaatschap en proefperiode
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          MuseaThuis Premium kost 7,99 per maand, met een introductieperiode
          waarin je de eerste maand tegen gereduceerd tarief kunt uitproberen.
          De daadwerkelijke betaal- en accountlogica voeg je later toe via je
          betaalprovider.
        </p>
      </section>
    </div>
  );
}
