export const metadata = {
  title: "Tours van vandaag",
  description:
    "Overzicht van de drie tours van vandaag: één gratis en twee voor premiumleden.",
};

type TourCardProps = {
  title: string;
  label: string;
  description: string;
  isPremium: boolean;
};

function TourCard({ title, label, description, isPremium }: TourCardProps) {
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
        Bekijk tour
      </button>
    </div>
  );
}

export default function ToursTodayPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Tours van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke dag selecteert MuseaThuis drie tours. Eén tour is gratis
          toegankelijk, de andere twee zijn beschikbaar voor premiumleden. Op
          deze pagina zie je in één oogopslag de onderwerpen en kun je een tour
          kiezen om te starten.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <TourCard
          title="Gratis tour van vandaag"
          label="Gratis"
          description="De gratis tour van vandaag, met een duidelijke rode draad en een compacte selectie meesterwerken."
          isPremium={false}
        />
        <TourCard
          title="Premiumtour 1"
          label="Tour"
          description="Een verdiepend thema, bijvoorbeeld rond een periode, museum of kunstenaar, met meer werken en uitleg."
          isPremium={true}
        />
        <TourCard
          title="Premiumtour 2"
          label="Tour"
          description="Een tweede premiumtour met een andere invalshoek, zodat je kunt kiezen wat het beste past bij je interesse."
          isPremium={true}
        />
      </section>
    </div>
  );
}
