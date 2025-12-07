export const metadata = {
  title: "Academie",
};

export default function AcademiePage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-2">Academie</h1>
        <p className="text-sm text-zinc-400">
          De Academie wordt de plek voor gestructureerde leerlijnen, cursussen
          en modules met voortgang en afsluitende toetsen.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
        Hier kun je later een catalogus van leerlijnen, voortgangsoverzichten
        en badgeoverzichten tonen; de basisstructuur is nog een skelet.
      </section>
    </main>
  );
}