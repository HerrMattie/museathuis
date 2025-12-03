// app/focus/page.tsx
import Link from 'next/link';

export default function FocusOverviewPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">Dagelijkse focus</p>
        <h1 className="text-2xl font-semibold">
          Focus van vandaag en extra verdiepingen
        </h1>
        <p className="text-sm text-gray-700 max-w-2xl">
          In de focusmodus blijf je tien minuten bij één werk. Je krijgt uitleg over
          maker, context, tijdsbeeld en techniek, zodat je echt de tijd neemt voor het beeld.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Gratis focus van vandaag */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Gratis
            </span>
            <h2 className="text-lg font-semibold">
              Focus van vandaag
            </h2>
            <p className="text-sm text-gray-700">
              Een rustige, museale uitleg bij één kunstwerk. Ideaal om even bewust
              stil te staan bij beeld, zonder afleiding.
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/focus/today"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Start focus van vandaag
            </Link>
          </div>
        </article>

        {/* Premium focus 1 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Verdieping · Techniek en materiaal
            </h2>
            <p className="text-sm text-gray-700">
              Extra aandacht voor techniek, materiaalgebruik en conservering. Voor wie de vakinhoud interessant vindt.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte focus-sessie.
          </p>
        </article>

        {/* Premium focus 2 */}
        <article className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between opacity-75">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
              Premium
            </span>
            <h2 className="text-lg font-semibold">
              Verdieping · Tijdsbeeld en invloed
            </h2>
            <p className="text-sm text-gray-700">
              Plaats het werk in zijn tijd en ontdek welke rol het speelt in de bredere kunstgeschiedenis.
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Beschikbaar voor MuseaThuis Premium. Later koppel je dit aan een echte focus-sessie.
          </p>
        </article>
      </section>
    </main>
  );
}
