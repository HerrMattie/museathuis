import Link from "next/link";

export default function HomePage() {
  const cards = [
    {
      href: "/tour",
      title: "Dagelijkse Tour",
      subtitle: "8 kunstwerken, 3 minuten audio per werk.",
      description: "Verdiep je in een samenhangend thema met een museale tekst en audio."
    },
    {
      href: "/game",
      title: "Dagelijkse Game",
      subtitle: "Speel, raad en verdien badges.",
      description: "Quiz, detailspel en tijdlijnspel op basis van dezelfde collectie."
    },
    {
      href: "/focus",
      title: "Focus",
      subtitle: "Eén werk, maximale aandacht.",
      description: "Slow looking sessie met context, reflectievragen en audio."
    }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-2">Vandaag</h2>
        <p className="text-sm text-slate-300 mb-4">
          Dit is de dagkaart van MuseaThuis: tour, game en focus als één pakket.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(card => (
            <Link key={card.href} href={card.href} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-500 transition">
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="text-xs text-slate-300 mb-2">{card.subtitle}</p>
              <p className="text-sm text-slate-200">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
