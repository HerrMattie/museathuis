export default function MuseumsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <section>
        <h1 className="text-3xl font-semibold mb-4">Voor musea en collectiebeheerders</h1>
        <p className="mb-4">
          MuseaThuis is geen vervanging van het museumbezoek, maar een brug. We brengen mensen
          thuis in aanraking met kunst en nodigen ze uit om daarna ook de zalen te bezoeken.
          Daarbij werken we graag samen met musea en collectiebeheerders.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Wat biedt MuseaThuis musea?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Extra zichtbaarheid van de collectie</strong><br />
            Kunstwerken worden opgenomen in thematische tours die ook buiten de eigen muren plaatsvinden.
          </li>
          <li>
            <strong>Context in de huiskamer</strong><br />
            Bezoekers worden voorbereid. Wie thuis al een tour heeft gevolgd, kijkt in het museum
            gerichter en met meer aandacht.
          </li>
          <li>
            <strong>Inzichten uit gebruiksdata</strong><br />
            Op termijn bieden we geanonimiseerde analyses over interessepatronen en kijkgedrag
            rond thema&apos;s, perioden en typen kunstwerken.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hoe gaan we met data om?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>We slaan geen herleidbare persoonsgegevens op.</li>
          <li>Profielen zijn anoniem en werken met categorieën zoals leeftijdsrange en interessegebied.</li>
          <li>Inzichten voor musea zijn altijd geaggregeerd, nooit op individueel niveau.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Mogelijke vormen van samenwerking</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Digitale thematours rond eigen hoogtepunten.</li>
          <li>Specials bij tentoonstellingen, om bereik en betrokkenheid te vergroten.</li>
          <li>Gezamenlijke contentontwikkeling rond thema&apos;s en narratieven.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Waarom dit past bij de toekomst van musea</h2>
        <p>
          Publiek oriënteert zich steeds vaker online voordat men een museum bezoekt. Diepgaande,
          digitale voorbereiding kan het bezoek intensiveren in plaats van vervangen. Door anonieme
          inzichten te koppelen aan museale vragen ontstaat een beter beeld van wat verschillende
          doelgroepen nodig hebben.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Wilt u verkennen wat MuseaThuis voor uw museum kan betekenen?
          Neem gerust contact op voor een verkennend gesprek.
        </p>
        <p className="text-sm text-neutral-600">
          (Hier kun je later een e-mailadres of contactformulier aan koppelen.)
        </p>
      </section>
    </main>
  );
}
