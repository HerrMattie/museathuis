// app/focus/page.tsx
import Link from "next/link";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";

export default function FocusPage() {
  const hasFocusForToday = false;

  if (!hasFocusForToday) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Focusmoment van vandaag
          </h1>
          <p className="text-sm text-slate-300">
            Het focusmoment van vandaag is nog niet gepubliceerd. Straks vindt u
            hier dagelijks een rustige verdieping bij één kunstwerk.
          </p>
        </header>
        <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-800" />
          <div className="space-y-3 text-sm text-slate-300">
            <h2 className="text-base font-semibold">Hoe een focusmoment werkt</h2>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Neem tien minuten en zet meldingen uit.</li>
              <li>Kijk eerst in stilte naar het werk in volledige schermweergave.</li>
              <li>Lees daarna de toelichting en luister straks naar de audio.</li>
            </ol>
            <p className="text-xs text-slate-400">
              Uw reacties en waarderingen helpen MuseaThuis om betere focusmomenten
              te selecteren en musea inzicht te geven in wat werkt.
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
        </div>
      </div>
    );
  }

  return <div>Focusmoment-weergave volgt.</div>;
}
