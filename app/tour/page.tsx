export const metadata = {
  title: "Tours",
};

export default function TourLandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Tours</h1>
        <p className="text-sm text-zinc-400">
          Tours zijn verhalende routes langs ongeveer acht kunstwerken, bedoeld
          voor een sessie van twintig tot dertig minuten met een doorlopende
          lijn.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Hier kun je later een kalender met komende tours, filters op thema en
        niveau en koppeling met Best of tonen. Voor nu verwijst de homepage
        direct naar de dagtours via de vandaag-tiles.
      </section>
    </main>
  );
}