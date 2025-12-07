export const metadata = {
  title: "Games",
};

export default function GameLandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Games</h1>
        <p className="text-sm text-zinc-400">
          Games helpen je spelenderwijs kunst te ontdekken via quizzen, memory
          en andere spelvormen die direct met kunstwerken zijn verbonden.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Hier volgt later een catalogus met speltypes, filters en moeilijkheid;
        de dagelijkse games zijn nu vooral via de vandaag-tiles bereikbaar.
      </section>
    </main>
  );
}