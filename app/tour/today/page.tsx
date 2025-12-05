import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { Card } from "@/components/common/Card";

type TourCard = {
  title: string;
  level: string;
  duration: string;
  collection: string;
  free: boolean;
};

const toursToday: TourCard[] = [
  {
    title: "Introductietour: Hoogtepunten vandaag",
    level: "Niveau 1",
    duration: "ca. 15 minuten",
    collection: "The Met en AIC",
    free: true,
  },
  {
    title: "Verdiepende tour: Portret en identiteit",
    level: "Niveau 2",
    duration: "ca. 20 minuten",
    collection: "Rijksmuseum en partners",
    free: false,
  },
  {
    title: "Thematische tour: Licht en kleur",
    level: "Niveau 2",
    duration: "ca. 20 minuten",
    collection: "Internationale collecties",
    free: false,
  },
];

export default function TourTodayPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Tours van vandaag</h1>
        <p className="text-sm text-slate-300">
          Elke dag biedt MuseaThuis een selectie van tours langs meerdere kunstwerken.
          Eén tour is gratis beschikbaar, twee tours zijn onderdeel van MuseaThuis Premium.
        </p>
        <p className="text-xs text-slate-400">
          Dit zijn voorbeeldtours. In een volgende fase worden deze kaarten gevuld met
          echte tours uit de database.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {toursToday.map((tour) => (
          <Card key={tour.title}>
            <div className="flex flex-col gap-2">
              <div className="mb-1 flex items-center gap-2">
                <Badge>{tour.level}</Badge>
                {tour.free ? <Badge>Gratis</Badge> : <PremiumLabel />}
              </div>
              <div className="h-24 rounded-xl bg-slate-800" />
              <h2 className="mt-2 text-sm font-semibold">{tour.title}</h2>
              <p className="text-xs text-slate-400">
                {tour.duration} · {tour.collection}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                In deze tour ziet u ongeveer acht kunstwerken met rustige uitleg en
                een duidelijke voortgang.
              </p>
              <div className="mt-3">
                <PrimaryButton className="w-full">
                  Bekijk tour (voorbeeld)
                </PrimaryButton>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="text-base font-semibold">Hoe tours werken</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ongeveer acht kunstwerken per tour met beeld en uitleg.</li>
          <li>Heldere indicatie van duur en niveau per tour.</li>
          <li>Na afloop kunt u de tour beoordelen met 1 tot 5 sterren.</li>
        </ul>
        <p className="text-xs text-slate-400">
          Uw waarderingen worden geanonimiseerd gebruikt voor Best of MuseaThuis en
          om musea inzicht te geven in wat goed werkt.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
        </Link>
        <Link href="/best-of">
          <SecondaryButton>Bekijk beste tours</SecondaryButton>
        </Link>
        <Link href="/profile">
          <SecondaryButton>Maak een gratis profiel aan</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
