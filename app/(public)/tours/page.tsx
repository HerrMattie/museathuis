import { SectionHero } from "@/components/section/SectionHero";
import { DayItemCard } from "@/components/section/DayItemCard";

export default function ToursPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Tours"
        subtitle="Dagelijkse kunsttours"
        description="Elke dag creëert MuseaThuis een nieuwe tour van ongeveer tien minuten, met acht kunstwerken, museale teksten en audio. Eén tour is altijd gratis; twee zijn onderdeel van MuseaThuis Premium."
      />

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-[0.35em] text-neutral-400">
          Vandaag
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <DayItemCard
            variant="free"
            label="Gratis"
            title="Tour van vandaag"
            description="Een zorgvuldig samengestelde route langs acht kunstwerken met een heldere lijn, inclusief audio. Ideaal als dagelijkse kunstpauze."
            href="/tour/today"
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Extra tour · Thema kleur & licht"
            description="Een aanvullende tour rond kleurgebruik en lichtval. Voor wie net iets dieper wil kijken en verbanden tussen werken wil ontdekken."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Extra tour · Meesterwerken uit de collectie"
            description="Een selectie van iconische werken met extra context over ontstaan, ontvangst en invloed op de kunstgeschiedenis."
          />
        </div>
      </section>
    </div>
  );
}
