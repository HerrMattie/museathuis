// app/game/page.tsx
import Link from 'next/link';

export default function GameOverviewPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Dagelijkse game</p>
        <h1 className="text-2xl font-semibold">
          Game van vandaag en extra games
        </h1>
        <p className="text-sm text-gray-700 max-w-2xl">
          Korte spelvormen helpen je oog te trainen: details zoeken, stijlen herkennen
          en visuele patronen zien. Elke dag is er een nieuwe game.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Gratis game van vandaag */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Gratis
            </span>
            <h2 className="text-lg font-semibold">
              Game van vandaag
            </h2>
            <p className="text-sm text-gray-700">
              Train je blik door specifieke details in kunstwerken te zoeken.
              Ideaal voor een korte, speelse kunstpauze.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/game/today"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Start game van vandaag
            </Link>
          </div>
        </article>

        {/* Premium game 1 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Stijlquiz
            </h2>
            <p className="text-sm text-gray-700">
              Herken kunststromingen aan fragmenten. Bij elke vraag hoort een korte
              uitleg zodat je spelenderwijs leert.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte game.
          </p>
        </article>

        {/* Premium game 2 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Tijdreis door kunst
            </h2>
            <p className="text-sm text-gray-700">
              Plaats werken in de juiste tijdsvolgorde en ontdek hoe beeldtaal zich
              door de eeuwen heen ontwikkelt.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte game.
          </p>
        </article>
      </section>
    </main>
  );
}
