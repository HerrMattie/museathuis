// app/tour/page.tsx
// Later maken we hier een async functie die echte data ophaalt.

const dummyWorks = [
  {
    id: 1,
    title: "Voorbeeldwerk 1",
    artist: "Voorbeeldkunstenaar",
    museum: "Rijksmuseum",
  },
  {
    id: 2,
    title: "Voorbeeldwerk 2",
    artist: "Voorbeeldkunstenaar",
    museum: "The Met",
  },
];

export default function TourPage() {
  return (
    <div className="py-10 space-y-8">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Tour van vandaag
        </p>
        <h1 className="text-3xl font-semibold">Dagelijkse kunsttour</h1>
        <p className="text-sm text-neutral-700 max-w-2xl">
          Dit is de tour van vandaag. In de definitieve versie wordt deze tour
          automatisch gekozen en ingepland in het CRM. Elk werk heeft audio van
          ongeveer drie minuten.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Kunstwerken in deze tour</h2>
        <div className="space-y-3">
          {dummyWorks.map((work) => (
            <div
              key={work.id}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{work.title}</p>
                <p className="text-neutral-600">
                  {work.artist} · {work.museum}
                </p>
              </div>
              <button className="text-xs rounded-full border px-3 py-1 hover:bg-neutral-100">
                Bekijk werk
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Jouw ervaring</h2>
        <p className="text-sm text-neutral-700 max-w-2xl">
          Na de koppeling met de database kun je hier de tour afronden, een
          beoordeling geven en badges verdienen. Voor nu is dit een visuele
          schets van de indeling.
        </p>
      </section>
    </div>
  );
}
