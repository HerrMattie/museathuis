import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-xs tracking-[0.25em] uppercase text-gray-500">
            Digitaal museum voor thuis
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Elke dag nieuwe tours, games en focusmomenten met kunst.
          </h1>
          <p className="text-sm text-gray-700">
            MuseaThuis combineert rustige audiotours, lichte spelvormen en
            verdiepende focus-sessies op losse kunstwerken. Speciaal ontworpen
            voor een vaste kunstroutine vanuit huis.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tour"
              className="rounded-full px-6 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "#5b7fba" }}
            >
              Bekijk tours van vandaag
            </Link>
            <Link
              href="/premium"
              className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Ontdek Premium
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <Link href="/tour" className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
                Tours
              </p>
              <p className="font-semibold">Dagelijkse kunsttours</p>
              <p className="text-xs text-gray-600">
                Circa 15–20 minuten audio per tour, rond één thema.
              </p>
            </div>
            <p className="mt-3 text-xs text-gray-500">1 gratis, 2 premium per dag</p>
          </Link>
          <Link href="/game" className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
                Games
              </p>
              <p className="font-semibold">Lichte kunstspellen</p>
              <p className="text-xs text-gray-600">
                Speelse quizzen zoals "Raad het jaar" op basis van echte collecties.
              </p>
            </div>
            <p className="mt-3 text-xs text-gray-500">1 gratis, 2 premium per dag</p>
          </Link>
          <Link href="/focus" className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
                Focus
              </p>
              <p className="font-semibold">Verdieping per kunstwerk</p>
              <p className="text-xs text-gray-600">
                Ongeveer 10 minuten audio per werk, stijl afgestemd op het beeld.
              </p>
            </div>
            <p className="mt-3 text-xs text-gray-500">1 gratis, 2 premium per dag</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
