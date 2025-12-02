import { HomeHero } from "@/components/home/HomeHero";
import { HomePanel } from "@/components/home/HomePanel";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <HomeHero />

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-[0.35em] text-neutral-400">
          Ontdek
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <HomePanel
            title="Tours"
            description="Dagelijkse kunsttours van circa tien minuten met audio en museale teksten."
            href="/tours"
            accent="tours"
          />
          <HomePanel
            title="Games"
            description="Speelse quizzen en opdrachten rond kunstwerken om je oog te trainen."
            href="/games"
            accent="games"
          />
          <HomePanel
            title="Focus"
            description="Tien minuten verdieping op één kunstwerk, met context, tijdsbeeld en techniek."
            href="/focus"
            accent="focus"
          />
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium uppercase tracking-[0.35em] text-neutral-400">
          Over MuseaThuis
        </h3>
        <p className="max-w-2xl text-sm text-neutral-300 leading-relaxed">
          MuseaThuis brengt dagelijks een nieuwe, zorgvuldig opgebouwde kunstervaring naar je
          woonkamer. Korte tours, speelse games en diepe focus-sessies helpen je stap voor stap
          een eigen kijk op kunst te ontwikkelen, zonder overload.
        </p>
      </section>
    </div>
  );
}
