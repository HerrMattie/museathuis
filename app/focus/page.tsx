import { SectionHero } from "@/components/section/SectionHero";
import { DayItemCard } from "@/components/section/DayItemCard";

export default function FocusPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Focus"
        subtitle="Tien minuten met één kunstwerk"
        description="In de focus-modus blijf je tien minuten bij één werk: context, tijdsbeeld, techniek en details. Een rustige, diepe blik zonder afleiding."
      />

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.35em] text-neutral-400">
          Vandaag
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DayItemCard
            variant="free"
            label="Gratis"
            title="Focus: één werk centraal"
            description="Rustig opgebouwde uitleg rond één kunstwerk, met aandacht voor maker, context en details."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Verdieping: techniek en materiaal"
            description="Extra aandacht voor techniek, materiaalgebruik en conservering."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Verdieping: tijdsbeeld en invloed"
            description="Hoe het werk past in zijn tijd en welke invloed het had op andere makers."
          />
        </div>
      </section>
    </div>
  );
}
