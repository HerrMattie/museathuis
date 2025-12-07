export const metadata = {
  title: "Focusmomenten",
};

export default function FocusLandingPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Focusmomenten</h1>
        <p className="text-sm text-zinc-400">
          Focusmomenten zijn korte verdiepingen van ongeveer tien minuten op
          een enkel kunstwerk, met een theaterachtige weergave en audio.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Hier komt later een overzicht van focusmomenten met filters en Best
        of-blokken; voorlopig ligt de nadruk op de dagweergave via de
        vandaag-tiles.
      </section>
    </main>
  );
}