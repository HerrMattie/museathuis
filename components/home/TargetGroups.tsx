// components/home/TargetGroups.tsx
export function TargetGroups() {
  const groups = [
    {
      title: "Beginnende kunstliefhebber",
      text: "Korte tours en toegankelijke uitleg, zonder voorkennis te veronderstellen.",
    },
    {
      title: "Ervaren museumbezoeker",
      text: "Verdiepingsfocus, thematische Academie en meer context bij bekende werken.",
    },
    {
      title: "Thuiszorg en mantelzorg",
      text: "Rustige Salonpresentaties en focusmomenten die een gesprek op gang helpen.",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Voor wie is MuseaThuis</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{group.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
