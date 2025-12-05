import Link from "next/link";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { DayTiles } from "@/components/home/DayTiles";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TargetGroups } from "@/components/home/TargetGroups";
import { BestOfPreview } from "@/components/home/BestOfPreview";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-8 sm:grid-cols-2 sm:px-8 sm:py-10">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Museale beleving thuis,{" "}
            <span className="text-amber-400">elke dag opnieuw</span>.
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            MuseaThuis selecteert dagelijks tours, spellen en focusmomenten met
            topkunst uit internationale collecties. Voor verdieping, rust en spel,
            gewoon in de woonkamer.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tour/today">
              <PrimaryButton>Bekijk de tour van vandaag</PrimaryButton>
            </Link>
            <Link href="/game">
              <SecondaryButton>Speel het gratis spel van vandaag</SecondaryButton>
            </Link>
            <Link href="/premium" className="text-sm text-amber-300">
              Ontdek MuseaThuis Premium
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Vandaag 1 tour, 1 spel en 1 focusmoment gratis beschikbaar. Met Premium
            ontgrendel je het volledige dagprogramma en de Academie.
          </p>
        </div>
        <div className="hidden items-center justify-center sm:flex">
          <div className="h-48 w-full max-w-xs rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="h-full rounded-2xl bg-slate-800" />
            <p className="mt-3 text-xs text-slate-400">
              Voorbeeld van een kunstwerk in focusmodus. Volledige schermvulling
              met tekst en audio volgen later.
            </p>
          </div>
        </div>
      </section>

      <DayTiles />
      <HowItWorks />
      <TargetGroups />
      <BestOfPreview />
    </div>
  );
}
