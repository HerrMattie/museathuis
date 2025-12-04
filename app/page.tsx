export default function TodayPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-2">Vandaag</h2>
        <p className="text-slate-300 max-w-2xl">
          Dit is de dagkaart van MuseaThuis: tour, game en focus als één pakket.
          De inhoud komt uit de collectie die jij in het CRM beheert.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xl font-semibold">Dagelijkse Tour</h3>
        <p className="text-slate-300">
          3 kunstwerken, circa 3 minuten audio per werk. Een samenhangend thema
          met een museale introductie en verdieping.
        </p>
        <p className="text-slate-400 text-sm">
          Straks: hier toon je automatisch de tour van vandaag vanuit Supabase
          (titel, thema, eerste werk).
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xl font-semibold">Dagelijkse Game</h3>
        <p className="text-slate-300">
          Speel, raad en verdien badges. Eén spelvorm per dag op basis van
          dezelfde collectie als de tour.
        </p>
        <p className="text-slate-400 text-sm">
          Straks: hier komt een kaart met de game van vandaag en een
          &ldquo;Start spel&rdquo;-knop.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xl font-semibold">Focus</h3>
        <p className="text-slate-300">
          Eén werk, maximale aandacht. Een slow-looking sessie met context,
          reflectievragen en audio.
        </p>
        <p className="text-slate-400 text-sm">
          Straks: hier toon je het focuswerk van vandaag met afbeelding,
          introductie en play-knop.
        </p>
      </section>
    </div>
  );
}
