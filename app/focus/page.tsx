export const metadata = {
  title: "Focusmomenten van vandaag",
  description:
    "Startpagina voor de drie focusmomenten van vandaag: één gratis en twee voor premiumleden.",
};

type FocusCardProps = {
  title: string;
  label: string;
  description: string;
  isPremium: boolean;
};

function FocusCard({ title, label, description, isPremium }: FocusCardProps) {
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
        Start focus
      </button>
    </div>
  );
}

export default function FocusPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Focusmomenten van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Een focusmoment is een rustige kijkmodus waarin één kunstwerk centraal
          staat. Elke dag selecteert MuseaThuis drie focusmomenten: één gratis
          en twee voor premiumleden. Kies welk werk je vandaag de meeste tijd
          wilt geven.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <FocusCard
          title="Gratis focusmoment van vandaag"
          label="Gratis"
          description="Een zorgvuldig gekozen kunstwerk met een korte, verdiepende toelichting en audio."
          isPremium={false}
        />
        <FocusCard
          title="Premiumfocus 1"
          label="Focus"
          description="Een premiumfocus met een andere invalshoek, bijvoorbeeld materiaalgebruik of detailstudie."
          isPremium={true}
        />
        <FocusCard
          title="Premiumfocus 2"
          label="Focus"
          description="Een tweede premiumfocus, zodat je kunt kiezen welke sfeer vandaag het beste bij je past."
          isPremium={true}
        />
      </section>
    </div>
  );
}
