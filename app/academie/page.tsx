import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";

type Track = {
  title: string;
  level: string;
  description: string;
  duration: string;
  premium: boolean;
};

const tracks: Track[] = [
  {
    title: "Hollandse Gouden Eeuw",
    level: "Basis",
    description:
      "Maak kennis met de belangrijkste kenmerken en kunstenaars van de Nederlandse zeventiende eeuw.",
    duration: "3 sessies van 20 minuten",
    premium: true,
  },
  {
    title: "Portret en identiteit",
    level: "Verdieping",
    description:
      "Onderzoek hoe kunstenaars identiteit en status vormgeven in portretten, van vroegmodern tot nu.",
    duration: "4 sessies van 25 minuten",
    premium: true,
  },
  {
    title: "Kennismaking met MuseaThuis",
    level: "Introductie",
    description:
      "Korte gratis introductiereeks waarin u de verschillende onderdelen van MuseaThuis leert kennen.",
    duration: "2 sessies van 15 minuten",
    premium: false,
  },
];

export default function AcademiePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">MuseaThuis Academie</h1>
        <p className="text-sm text-slate-300">
          De Academie biedt thematische leerlijnen over periodes, thema's en kunstenaars.
          Elke leerlijn bestaat uit een combinatie van tours, focusmomenten en soms spellen.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <div
            key={track.title}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge>{track.level}</Badge>
              {track.premium ? <PremiumLabel /> : <Badge>Gratis introductie</Badge>}
            </div>
            <h2 className="text-sm font-semibold">{track.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{track.description}</p>
            <p className="mt-2 text-xs text-slate-400">{track.duration}</p>
            <div className="mt-3 text-xs text-slate-400">
              Bestaat straks uit meerdere tours, focusmomenten en eventueel spellen.
            </div>
            <div className="mt-4">
              <PrimaryButton className="w-full">Bekijk traject (voorbeeld)</PrimaryButton>
            </div>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="mb-1 text-base font-semibold">Voortgang en profiel</h2>
        <p>
          In een volgende stap toont MuseaThuis hier per leerlijn uw voortgang,
          bewaarde favorieten en badges. Daarmee ontstaat een overzicht van welke
          onderdelen u al heeft gevolgd en wat nog open staat, gekoppeld aan uw profiel.
        </p>
      </section>
    </div>
  );
}
