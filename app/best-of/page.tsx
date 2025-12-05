import Link from "next/link";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";
import { PrimaryButton } from "@/components/common/PrimaryButton";

type BestOfCardProps = {
  type: string;
  title: string;
  description: string;
  stats: string;
};

function BestOfCard({ type, title, description, stats }: BestOfCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Badge>{type}</Badge>
        <PremiumLabel />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      <p className="mt-2 text-xs text-slate-400">{stats}</p>
      <div className="mt-3">
        <PrimaryButton className="w-full">Bekijk dit onderdeel (voorbeeld)</PrimaryButton>
      </div>
    </div>
  );
}

export default function BestOfPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Het beste van MuseaThuis
        </h1>
        <p className="text-sm text-slate-300">
          Hier verschijnen straks de tours, spellen en focusmomenten die het beste scoren
          op waardering en gebruik. Per week en maand, per doelgroep.
        </p>
        <p className="text-xs text-slate-400">
          De huidige voorbeelden zijn democontent. In een volgende fase worden deze lijsten
          gevuld op basis van echte ratings en gebruiksdata.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Top tours</h2>
        <p className="text-sm text-slate-300">
          Gebaseerd op gemiddelde waardering, aantal beoordelingen en bekeken minuten.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <BestOfCard
            type="Tour"
            title="Weekselectie: Introductie Gouden Eeuw"
            description="Korte tour langs drie kernwerken, geschikt voor beginnende kunstliefhebbers."
            stats="4,8 ★ · 320 beoordelingen · 1.200 weergaven"
          />
          <BestOfCard
            type="Tour"
            title="Weekselectie: Portret en identiteit"
            description="Tour met vijf portretten die laten zien hoe identiteit in beeld wordt gebracht."
            stats="4,7 ★ · 210 beoordelingen · 980 weergaven"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Top spellen</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <BestOfCard
            type="Spel"
            title="Herken het detail"
            description="Kies het juiste kunstwerk bij een ingezoomd detail. Speelduur ongeveer tien minuten."
            stats="4,6 ★ · 260 beoordelingen · 1.500 spellen"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Top focusmomenten</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <BestOfCard
            type="Focusmoment"
            title="Stilleven met glaswerk"
            description="Rustig focusmoment bij een schilderij waarin licht, glas en reflecties centraal staan."
            stats="4,9 ★ · 180 beoordelingen · 900 weergaven"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        <h2 className="mb-1 text-base font-semibold">Hoe selecteren wij het beste</h2>
        <p>
          MuseaThuis combineert waarderingen, gebruiksdata en duur van interactie om
          te bepalen welke tours, spellen en focusmomenten het best aansluiten bij
          verschillende doelgroepen. Deze data wordt geanonimiseerd en alleen op
          geaggregeerd niveau met musea gedeeld.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
        </Link>
        <Link href="/premium">
          <PrimaryButton>Ontdek MuseaThuis Premium</PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
