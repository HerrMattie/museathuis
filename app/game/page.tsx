export const metadata = {
  title: "Spellen van vandaag",
  description:
    "Ontvangstpagina voor de drie kunstspellen van vandaag: één gratis en twee voor premiumleden.",
};

type GameCardProps = {
  title: string;
  label: string;
  description: string;
  isPremium: boolean;
};

function GameCard({ title, label, description, isPremium }: GameCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex gap-4">
        <div className="hidden h-24 w-20 flex-none rounded-lg bg-slate-800 sm:block" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {label}
            </p>
            {isPremium && (
              <span className="rounded-full border border-amber-500/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Premium
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <p className="text-xs text-slate-300">{description}</p>
        </div>
      </div>
      <button className="mt-4 inline-flex text-xs font-medium text-amber-300 hover:text-amber-200">
        Speel nu
      </button>
    </div>
  );
}

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Spellen van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          MuseaThuis biedt elke dag drie kunstspellen. Eén spel is gratis
          toegankelijk, twee zijn beschikbaar voor premiumleden. De spellen
          variëren van herkenningsopdrachten tot verdiepende quizzen over
          specifieke thema&apos;s of periodes.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <GameCard
          title="Gratis spel van vandaag"
          label="Gratis"
          description="Een laagdrempelig spel om in te stappen, op basis van een selectie kunstwerken van vandaag."
          isPremium={false}
        />
        <GameCard
          title="Premiumspel 1"
          label="Spel"
          description="Een spel met meer uitdaging, bijvoorbeeld met tijdsdruk of meerdere rondes."
          isPremium={true}
        />
        <GameCard
          title="Premiumspel 2"
          label="Spel"
          description="Een tweede premiumspel met een andere insteek, zodat je kunt kiezen wat het beste past bij je stemming."
          isPremium={true}
        />
      </section>
    </div>
  );
}
