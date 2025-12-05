import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { Card } from "@/components/common/Card";

type FocusCard = {
  title: string;
  theme: string;
  duration: string;
  free: boolean;
};

const focusToday: FocusCard[] = [
  {
    title: "Gratis focus: Stilleven met glaswerk",
    theme: "Stilleven",
    duration: "ca. 10 minuten",
    free: true,
  },
  {
    title: "Premium focus: Portret en identiteit",
    theme: "Portret",
    duration: "ca. 10 minuten",
    free: false,
  },
  {
    title: "Premium focus: Licht in het landschap",
    theme: "Landschap",
    duration: "ca. 10 minuten",
    free: false,
  },
];

export default function FocusPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Focusmomenten van vandaag
        </h1>
        <p className="text-sm text-slate-300">
          Een focusmoment is tien minuten geconcentreerde aandacht bij één kunstwerk.
          U kijkt eerst in stilte en leest daarna de toelichting, later aangevuld met audio.
        </p>
        <p className="text-xs text-slate-400">
          Hieronder ziet u één gratis focusmoment en twee premiumvoorbeelden. In een
          volgende fase worden deze kaarten gekoppeld aan echte focusmomenten.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {focusToday.map((focus) => (
          <Card key={focus.title}>
            <div className="flex flex-col gap-2">
              <div className="mb-1 flex items-center gap-2">
                <Badge>{focus.theme}</Badge>
                {focus.free ? <Badge>Gratis</Badge> : <PremiumLabel />}
                <Badge>Rustmodus</Badge>
              </div>
              <div className="h-24 rounded-xl bg-slate-800" />
              <h2 className="mt-2 text-sm font-semibold">{focus.title}</h2>
              <p className="text-xs text-slate-400">{focus.duration}</p>
              <p className="mt-1 text-sm text-slate-300">
                Neem bewust tien minuten, zet meldingen uit en volg het ritme van kijken
                en lezen. Ideaal voor alleen of met een kleine groep.
              </p>
              <div className="mt-3">
                <PrimaryButton className="w-full">
                  Start focusmoment (voorbeeld)
                </PrimaryButton>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-800" />
        <div className="space-y-3 text-sm text-slate-300">
          <h2 className="text-base font-semibold">Hoe een focusmoment verloopt</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Neem tien minuten en zorg voor een rustige omgeving.</li>
            <li>Kijk eerst in stilte naar het werk in volledige schermweergave.</li>
            <li>Lees daarna de toelichting en luister straks naar de audio.</li>
          </ol>
          <p className="text-xs text-slate-400">
            Focusmomenten zijn ook geschikt voor thuiszorg, mantelzorg en dagbesteding
            als gespreksstarter rond kunst.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
        </Link>
        <Link href="/salon">
          <SecondaryButton>Bekijk Salonpresentaties</SecondaryButton>
        </Link>
        <Link href="/academie">
          <SecondaryButton>Bekijk gerelateerde Academie-trajecten</SecondaryButton>
        </Link>
        <Link href="/profile">
          <SecondaryButton>Maak een gratis profiel aan</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
