import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { Card } from "@/components/common/Card";

type GameCard = {
  title: string;
  type: string;
  duration: string;
  free: boolean;
};

const gamesToday: GameCard[] = [
  {
    title: "Gratis spel: Welk werk hoort bij deze beschrijving",
    type: "Herkenningsspel",
    duration: "ca. 10 minuten",
    free: true,
  },
  {
    title: "Premium spel: Herken het detail",
    type: "Kijkspel",
    duration: "ca. 10 minuten",
    free: false,
  },
  {
    title: "Premium spel: Verdiepingsquiz",
    type: "Quiz",
    duration: "ca. 12 minuten",
    free: false,
  },
];

export default function GamePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Spellen van vandaag</h1>
        <p className="text-sm text-slate-300">
          Speel dagelijks een gratis spel en twee premiumspellen met kunstwerken uit
          het dagprogramma. Van korte kijkspellen tot quizzen en verdiepingsvragen.
        </p>
        <p className="text-xs text-slate-400">
          De onderstaande spellen zijn voorbeelden. In een volgende fase worden deze
          kaarten gekoppeld aan echte spellen uit de database.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {gamesToday.map((game) => (
          <Card key={game.title}>
            <div className="flex flex-col gap-2">
              <div className="mb-1 flex items-center gap-2">
                <Badge>{game.type}</Badge>
                {game.free ? <Badge>Gratis</Badge> : <PremiumLabel />}
              </div>
              <div className="h-24 rounded-xl bg-slate-800" />
              <h2 className="mt-2 text-sm font-semibold">{game.title}</h2>
              <p className="text-xs text-slate-400">{game.duration}</p>
              <p className="mt-1 text-sm text-slate-300">
                U krijgt een vraag of opdracht bij kunstwerken en kiest uit meerdere
                mogelijkheden. Ideaal voor een korte speelpauze.
              </p>
              <div className="mt-3">
                <PrimaryButton className="w-full">
                  Start spel (voorbeeld)
                </PrimaryButton>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="text-base font-semibold">Hoe spellen werken</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Speelduur ongeveer tien minuten per spel.</li>
          <li>Na afloop kunt u het spel beoordelen met 1 tot 5 sterren.</li>
          <li>Spelresultaten worden anoniem gebruikt voor verbeteringen en Best of MuseaThuis.</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
        </Link>
        <Link href="/best-of">
          <SecondaryButton>Bekijk beste spellen</SecondaryButton>
        </Link>
        <Link href="/profile">
          <SecondaryButton>Maak een gratis profiel aan</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
