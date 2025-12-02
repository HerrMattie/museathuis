import { SectionHero } from "@/components/section/SectionHero";
import { DayItemCard } from "@/components/section/DayItemCard";

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Games"
        subtitle="Speels kijken naar kunst"
        description="Korte spelvormen helpen je oog te trainen: van details zoeken tot stijlen herkennen. Elke dag is er een nieuwe game, altijd met één gratis startpunt."
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
            description="Vind specifieke details in meesterwerken en train je blik. Ideaal voor een korte speelse pauze."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Stijlquiz"
            description="Herken stromingen en stijlen op basis van beeldfragmenten. Met uitleg per vraag."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Tijdreis door kunst"
            description="Plaats werken in de juiste tijdsvolgorde en ontdek hoe beeldtaal zich ontwikkelt door de eeuwen heen."
          />
        </div>
      </section>
    </div>
  );
}
