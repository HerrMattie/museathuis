// app/tour/page.tsx
import Link from 'next/link';

export default function TourOverviewPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Dagelijkse tour</p>
        <h1 className="text-2xl font-semibold">
          Tour van vandaag en extra tours
        </h1>
        <p className="text-sm text-gray-700 max-w-2xl">
          MuseaThuis maakt elke dag een nieuwe tour van ongeveer tien minuten,
          met acht kunstwerken en museale tekst. Eén tour is gratis, twee tours zijn
          onderdeel van MuseaThuis Premium.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Gratis tour van vandaag */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Gratis
            </span>
            <h2 className="text-lg font-semibold">
              Tour van vandaag
            </h2>
            <p className="text-sm text-gray-700">
              Een zorgvuldig samengestelde route langs acht kunstwerken met een duidelijke lijn,
              inclusief audio. Ideaal voor je dagelijkse kunstmoment.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/tour/today"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Start tour van vandaag
            </Link>
          </div>
        </article>

        {/* Premium tour 1 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Extra tour · Kleur en licht
            </h2>
            <p className="text-sm text-gray-700">
              Een aanvullende tour rond kleurgebruik en lichtval. Voor wie net iets dieper
              wil kijken en verbanden tussen werken wil ontdekken.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte tour.
          </p>
        </article>

        {/* Premium tour 2 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Extra tour · Meesterwerken
            </h2>
            <p className="text-sm text-gray-700">
              Een selectie van iconische werken met extra context over ontstaan, ontvangst
              en invloed op de kunstgeschiedenis.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte tour.
          </p>
        </article>
      </section>
    </main>
  );
}
