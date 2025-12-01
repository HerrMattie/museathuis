export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <section>
        <h1 className="text-3xl font-semibold mb-4">Over MuseaThuis</h1>
        <p className="mb-4">
          MuseaThuis brengt het museum naar je woonkamer. Voor iedereen die van kunst houdt,
          maar niet dagelijks in de musea kan staan. Je krijgt thuis dezelfde rust, verdieping
          en verwondering, in een vorm die past bij je leven nu.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Waarom MuseaThuis?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Diepgang zonder drempels</strong><br />
            Geen vluchtige posts, maar zorgvuldig opgebouwde verhalen per kunstwerk, in heldere taal.
          </li>
          <li>
            <strong>Thuis genieten, wanneer het jou uitkomt</strong><br />
            Een dagelijkse tour die je kunt starten op de bank, aan de keukentafel of onderweg.
          </li>
          <li>
            <strong>Kwaliteit als uitgangspunt</strong><br />
            Teksten en audio zijn opgebouwd vanuit museale standaarden: feitelijk, genuanceerd
            en transparant over onzekerheden in de kunstgeschiedenis.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hoe werkt het?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Elke dag een nieuwe tour</strong><br />
            Een zorgvuldig samengestelde route langs verschillende kunstwerken rond een thema,
            periode of vraag.
          </li>
          <li>
            <strong>Per kunstwerk circa drie minuten audio</strong><br />
            Genoeg tijd om echt te kijken en te begrijpen, zonder dat het zwaar wordt.
          </li>
          <li>
            <strong>Lichte spelelementen</strong><br />
            Korte quizvragen, badges en rankings maken het leuk om terug te komen, zonder dat
            het ten koste gaat van de inhoud.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Voor wie is MuseaThuis?</h2>
        <p>
          MuseaThuis is er voor kunstliefhebbers die meer willen dan een korte beschrijving naast
          het schilderij. Voor mensen die graag leren in hun eigen tempo, thuis of onderweg. En voor
          iedereen die het museumgevoel mist, maar wel toegang wil houden tot hoogwaardige cultuur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">AI met een museale blik</h2>
        <p className="mb-2">
          Onze AI helpt bij het selecteren en beschrijven van kunstwerken, maar altijd binnen
          duidelijke kaders:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>kunstwerken worden alleen binnen een tour met elkaar vergeleken</li>
          <li>de toon blijft museaal, respectvol en transparant</li>
          <li>we houden scherp in de gaten of de informatie klopt en passen aan waar nodig</li>
        </ul>
      </section>

      <section>
        <p>
          MuseaThuis is gebouwd voor langetermijngebruik: rustig, betrouwbaar en inhoudelijk sterk.
          Zodat je elke dag een moment van echte aandacht voor kunst kunt inbouwen.
        </p>
      </section>
    </main>
  );
}
