export default function PremiumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <section>
        <h1 className="text-3xl font-semibold mb-4">MuseaThuis Premium</h1>
        <p className="mb-4">
          Met MuseaThuis Premium haal je het volledige potentieel van het platform naar boven.
          Je krijgt toegang tot extra tours, extra spelvormen en verdiepende focus sessies
          op losse kunstwerken.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Wat krijg je met Premium?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Twee extra premiumtours per dag</strong><br />
            Tours met meer werken, meer context en extra vergelijkingen.
          </li>
          <li>
            <strong>Twee premium games per dag</strong><br />
            Korte, slimme spellen rond stijl, techniek, details en tijdlijn.
          </li>
          <li>
            <strong>Focus modus op geselecteerde kunstwerken</strong><br />
            Verdieping van ongeveer tien minuten op één werk: kunstenaar, tijdsgeest,
            techniek en betekenis.
          </li>
          <li>
            <strong>Toegang tot week en maandselecties</strong><br />
            Overzicht van best beoordeelde tours en games van de afgelopen periode.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Waarom Premium de moeite waard is</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Meer vaste momenten van kwaliteit per week.</li>
          <li>Meer verdieping in minder tijd, zonder te verdwalen in aanbod.</li>
          <li>
            Je ondersteunt de doorontwikkeling van het platform richting nieuwe functies,
            cursussen en specials.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prijs en voorwaarden</h2>
        <p>Prijs: <strong>€ 7,99 per maand</strong></p>
        <p>Maandelijks opzegbaar, zonder verborgen kosten of extra modules.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Start vandaag</h2>
        <p>
          Start vandaag en ervaar hoe het is om elke dag een compleet uitgewerkte kunsttour
          in huis te hebben.
        </p>
        <button
          className="inline-flex items-center rounded-full border px-6 py-2 text-sm font-medium
                     hover:bg-neutral-100 transition"
        >
          Word Premium
        </button>
      </section>
    </main>
  );
}
