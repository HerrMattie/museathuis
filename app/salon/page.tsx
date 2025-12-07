export const metadata = {
  title: "Salon",
};

export default function SalonPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Salon</h1>
        <p className="text-sm text-zinc-400">
          Salon is de presentatiemodus voor tv of beamer, waarin je thematische
          slideshows van kunstwerken als sfeerbeeld in de ruimte toont.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Op deze pagina kun je later sets kiezen op basis van thema, museum of
        stemming en een fullscreen slideshow starten; de onderliggende tabellen
        voor salon_sets zijn al aanwezig.
      </section>
    </main>
  );
}