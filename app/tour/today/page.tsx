// app/tour/today/page.tsx
import Link from "next/link";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";

export default function TourTodayPage() {
  // In latere stap verbinden met Supabase om gepubliceerde tour op te halen
  const hasTourForToday = false;

  if (!hasTourForToday) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tour van vandaag
          </h1>
          <p className="text-sm text-slate-300">
            De tour van vandaag is nog niet gepubliceerd. Binnenkort verschijnt
            hier dagelijks een nieuwe tour met ongeveer acht kunstwerken.
          </p>
        </header>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="mb-1 text-base font-semibold">Wat kun je straks verwachten</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Ongeveer acht kunstwerken per tour, met beeld en uitleg.</li>
            <li>Indicatie van duur en moeilijkheid per tour.</li>
            <li>Heldere voortgangsbalk en afsluitend beoordelingsmoment.</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/">
            <PrimaryButton>Terug naar vandaag-overzicht</PrimaryButton>
          </Link>
          <Link href="/best-of">
            <SecondaryButton>Bekijk voorbeeldselecties</SecondaryButton>
          </Link>
        </div>
      </div>
    );
  }

  // Placeholder voor toekomstige tourweergave
  return (
    <div>Tourweergave volgt.</div>
  );
}
