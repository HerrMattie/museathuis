import Link from "next/link";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Premium
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
            MuseaThuis Premium (pilot)
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            In deze fase testen we MuseaThuis met een kleine groep gebruikers. Premium geeft toegang tot extra tours,
            spellen, focusmomenten en later de MuseaThuis Academie.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-900/80 p-5">
            <h2 className="text-sm font-semibold text-slate-100">Gratis profiel</h2>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-300">
              <li>Dagelijkse gratis tour, spel en focusmoment</li>
              <li>Eigen profiel en voorkeuren opslaan</li>
              <li>Kunstwerken beoordelen met sterren</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-amber-400/10 p-5 ring-1 ring-amber-400/40">
            <h2 className="text-sm font-semibold text-amber-300">Premium (pilot)</h2>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-200">
              <li>Dagelijks meerdere tours en spellen</li>
              <li>Extra focusmomenten en themalijnen</li>
              <li>Toegang tot de MuseaThuis Academie</li>
            </ul>
            <p className="mt-3 text-xs text-amber-200/80">
              Tijdens de pilot wordt premium handmatig geactiveerd. Neem contact op als u wilt deelnemen.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
          <p>
            In een latere fase koppelen we hier een betaalmodule. Nu gebruiken we premium vooral om functies te testen
            en feedback van ervaren museumbezoekers op te halen.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Tip: maak eerst een gratis profiel aan en probeer de dagelijkse tours, spellen en focusmomenten uit. Premium
            bouwt hierop voort.
          </p>
        </section>

        <div className="mt-6 text-sm">
          <Link href="/" className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-900">
            Terug naar vandaag
          </Link>
        </div>
      </div>
    </div>
  );
}
