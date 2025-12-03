import { SectionHero } from "@/components/section/SectionHero";
import { DayItemCard } from "@/components/section/DayItemCard";

export default function GameOverviewPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Game"
        subtitle="Speels kijken naar kunst"
        description="Dagelijkse kunstgames helpen je oog te trainen: details zoeken, stijlen herkennen en visuele patronen zien."
      />

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.35em] text-neutral-400">
          Vandaag
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <DayItemCard
            variant="free"
            label="Gratis"
            title="Zoek het detail"
            description="Train je oog met het zoeken van specifieke details in meesterwerken."
            href="/game/today"
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Stijlquiz"
            description="Herken kunststromingen op basis van fragmenten. Inclusief toelichting."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Tijdreis door kunst"
            description="Plaats werken in de juiste tijdsvolgorde en ontdek visuele evolutie."
          />
        </div>
      </section>
    </div>
  );
}
