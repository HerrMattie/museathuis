import { SectionHero } from "@/components/section/SectionHero";
import { DayItemCard } from "@/components/section/DayItemCard";

export default function TourOverviewPage() {
  return (
    <div className="space-y-6">
      <SectionHero
        title="Tour"
        subtitle="Dagelijkse kunsttour"
        description="Elke dag creëert MuseaThuis een nieuwe tour van ongeveer tien minuten, met acht kunstwerken, museale teksten en audio. Eén tour is gratis; twee zijn onderdeel van MuseaThuis Premium."
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
            description="Een zorgvuldig samengestelde route langs acht kunstwerken met audio. Ideaal voor een dagelijkse kunstpauze."
            href="/tour/today"
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Extra tour · Thema kleur & licht"
            description="Een thematische tour rond kleurgebruik en lichtval. Voor wie dieper wil kijken."
          />
          <DayItemCard
            variant="premium"
            label="Premium"
            title="Extra tour · Meesterwerken"
            description="Iconische werken met context over ontstaan, ontvangst en invloed op de kunstgeschiedenis."
          />
        </div>
      </section>
    </div>
  );
}
