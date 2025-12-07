export function HowItWorks() {
  const steps = [
    {
      title: "Kies tour, spel of focus",
      text: "Start bij het dagprogramma of Best of MuseaThuis. Elk onderdeel heeft een duidelijke duur en moeilijkheidsniveau.",
    },
    {
      title: "Kijk of speel in uw eigen tempo",
      text: "Gebruik telefoon, tablet of televisie. Focusmodus en Salon zijn ontworpen voor rust en concentratie.",
    },
    {
      title: "Beoordeel en ontvang betere suggesties",
      text: "Uw waarderingen en gebruik worden anoniem gebruikt om het aanbod te verbeteren en musea inzicht te geven.",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Hoe MuseaThuis werkt</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-slate-950">
              {index + 1}
            </div>
            <h3 className="text-sm font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
