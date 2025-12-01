import Link from "next/link";

const testTour = {
  id: "test-tour-1",
  title: "Testtour: Schilderijen uit de Gouden Eeuw",
  durationMinutes: 18,
  works: [
    {
      id: "work-1",
      title: "Portret van een koopman",
      artist: "Voorbeeldkunstenaar",
      museum: "Rijksmuseum",
    },
    {
      id: "work-2",
      title: "Gezicht op de haven",
      artist: "Voorbeeldkunstenaar",
      museum: "Rijksmuseum",
    },
    {
      id: "work-3",
      title: "Stilleven met boeken",
      artist: "Voorbeeldkunstenaar",
      museum: "Rijksmuseum",
    },
  ],
};

export default function TodayTourPage() {
  return (
    <div className="py-10 space-y-8">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Tour van vandaag (test)
        </p>
        <h1 className="text-3xl font-semibold">{testTour.title}</h1>
        <p className="text-sm text-neutral-700 max-w-2xl">
          Dit is een testtour om de pagina en indeling te controleren.
          Later wordt deze tour automatisch uit het CRM en de database geladen.
        </p>
        <p className="text-xs text-neutral-500">
          Totale luistertijd circa {testTour.durationMinutes} minuten.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Kunstwerken in deze tour</h2>
        <div className="space-y-3">
          {testTour.works.map((work) => (
            <div
              key={work.id}
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{work.title}</p>
                <p className="text-neutral-600">
                  {work.artist} · {work.museum}
                </p>
              </div>
              <button className="text-xs rounded-full border px-3 py-1 hover:bg-neutral-100">
                Luister fragment
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Volgende stap</h2>
        <p className="text-sm text-neutral-700 max-w-2xl">
          Als deze opzet goed voelt, koppelen we deze pagina in de volgende stap
          aan een echte tour uit je database en planning.
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[#5b7fba] hover:underline"
        >
          Terug naar home
        </Link>
      </section>
    </div>
  );
} 
