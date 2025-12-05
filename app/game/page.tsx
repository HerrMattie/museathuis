import Link from "next/link";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";

export default function GamePage() {
  const hasGameForToday = false;

  if (!hasGameForToday) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Spel van vandaag</h1>
          <p className="text-sm text-slate-300">
            Binnenkort speelt u hier dagelijks een nieuw spel met kunstwerken uit
            het dagprogramma. Van korte kijkspellen tot quizzen en verdiepingsvragen.
          </p>
        </header>
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-2">
            <Badge>Gratis spel</Badge>
            <PremiumLabel />
          </div>
          <h2 className="text-sm font-semibold">
            Voorbeeld: Welk werk hoort bij deze beschrijving
          </h2>
          <p className="text-sm text-slate-300">
            U ziet beschrijvingen van kunstwerken en kiest uit meerdere afbeeldingen.
            De spellen duren ongeveer tien minuten en zijn ontworpen voor thuisgebruik.
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Link href="/">
            <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
          </Link>
          <Link href="/best-of">
            <SecondaryButton>Bekijk beste spellen</SecondaryButton>
          </Link>
        </div>
      </div>
    );
  }

  return <div>Spelweergave volgt.</div>;
}
