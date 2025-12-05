// app/salon/page.tsx
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";

export default function SalonPage() {
  const sets = [
    {
      title: "Rijksmuseum-sfeer",
      description:
        "Een klassieke Salonpresentatie met werken uit de Nederlandse Gouden Eeuw en daar omheen.",
      duration: "ca. 20 minuten",
      works: "12 werken",
      premium: true,
    },
    {
      title: "Louvre-sfeer",
      description:
        "Een selectie met rustiger tempo, geschikt als achtergrond bij een diner of avond met familie.",
      duration: "ca. 25 minuten",
      works: "15 werken",
      premium: true,
    },
    {
      title: "Voorproef Salon",
      description:
        "Korte gratis presentatie met een selectie van verschillende musea, bedoeld als kennismaking.",
      duration: "ca. 8 minuten",
      works: "6 werken",
      premium: false,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Salonpresentaties</h1>
        <p className="text-sm text-slate-300">
          Salon is de schermvullende modus van MuseaThuis. Kunstwerken volgen elkaar
          rustig op, bijna zonder tekst. Ideaal voor televisie of groot scherm.
        </p>
        <p className="text-xs text-slate-400">
          Een deel van de Salonpresentaties is gratis. De volledige sets zijn
          beschikbaar voor premiumleden.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {sets.map((set) => (
          <div
            key={set.title}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge>Salon</Badge>
              {set.premium ? <PremiumLabel /> : <Badge>Gratis voorproef</Badge>}
            </div>
            <div className="mb-3 h-24 rounded-xl bg-slate-800" />
            <h2 className="text-sm font-semibold">{set.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{set.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              {set.duration} · {set.works}
            </p>
            <div className="mt-4">
              <PrimaryButton className="w-full">Start presentatie</PrimaryButton>
            </div>
          </div>
        ))}
      </div>
      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="text-base font-semibold">Stel je eigen Salon samen</h2>
        <p>
          In de volgende fase kunt u eigen Salonpresentaties samenstellen met filters
          voor museum, periode, thema, techniek, kleuren en duur. MuseaThuis laat dan
          direct zien hoeveel werken aan uw filters voldoen.
        </p>
      </section>
    </div>
  );
}
