export const metadata = {
  title: "Profiel",
  description:
    "Overzicht van je gegevens, gebruik, voorkeuren en badges binnen MuseaThuis.",
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Jouw profiel
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          In je profiel zie je welke gegevens je hebt gedeeld, hoe je MuseaThuis
          gebruikt en welke badges je al hebt verdiend. Gegevens worden
          geanonimiseerd gebruikt om musea beter inzicht te geven in publiek en
          kijkgedrag.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xl font-semibold text-slate-50">Over jou</h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Hier kun je demografische gegevens beheren, zoals leeftijdscategorie,
          geslacht, provincie, land, museumkaart en achtergrond. Deze informatie
          wordt alleen in geaggregeerde vorm met musea gedeeld.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xl font-semibold text-slate-50">Je gebruik</h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Dit blok toont samenvattingen van je gebruik: hoeveel tours, spellen,
          focusmomenten en Salon-sessies je hebt bekeken en hoe vaak je met de
          Academie hebt gewerkt.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xl font-semibold text-slate-50">Badges</h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Badges belonen herhaald gebruik, verdieping en variatie. Sommige
          badges kun je steeds opnieuw verdienen, bijvoorbeeld door alle
          activiteiten van een dag te doorlopen of meerdere weken achter elkaar
          actief te zijn.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="h-20 rounded-lg border border-slate-700 bg-slate-900/40" />
          <div className="h-20 rounded-lg border border-slate-700 bg-slate-900/40" />
          <div className="h-20 rounded-lg border border-slate-700 bg-slate-900/40" />
        </div>
      </section>
    </div>
  );
}
