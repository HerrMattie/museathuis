import { Badge } from "@/components/common/Badge";

export function TargetGroups() {
  const groups = [
    {
      title: "Beginnende kunstliefhebber",
      label: "Niveau 1",
      text: "Korte tours en toegankelijke uitleg, zonder voorkennis te veronderstellen.",
    },
    {
      title: "Ervaren museumbezoeker",
      label: "Niveau 2",
      text: "Verdiepende focusmomenten, thematische Academie en meer context bij bekende werken.",
    },
    {
      title: "Thuiszorg en mantelzorg",
      label: "Specifieke context",
      text: "Rustige Salonpresentaties en focusmomenten als gespreksstarter in kleinere groepen.",
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
            <div className="mb-2">
              <Badge>{group.label}</Badge>
            </div>
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{group.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
