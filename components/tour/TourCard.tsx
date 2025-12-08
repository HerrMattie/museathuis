import Link from "next/link";

type TourCardProps = {
  tour: any; // data komt uit je dagprogramma-view / query
};

export default function TourCard({ tour }: TourCardProps) {
  const isPremium = !!tour.is_premium;
  const worksCount = tour.works_count ?? tour.items_count ?? null;
  const durationMin = tour.duration_min ?? null;

  const metaParts: string[] = [];
  if (durationMin) {
    metaParts.push(`Ongeveer ${durationMin} minuten`);
  }
  if (worksCount) {
    metaParts.push(`${worksCount} werken`);
  }
  const metaText = metaParts.join(" · ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-5 shadow-sm transition hover:border-amber-400/80 hover:shadow-lg">
      {/* bovenste rij: badge + type-label */}
      <div className="mb-3 flex items-center justify-between gap-3 text-xs">
        <div
          className={
            "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium " +
            (isPremium
              ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40"
              : "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/40")
          }
        >
          {isPremium ? "Premium" : "Gratis"}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          {tour.type_label ?? "Dagelijkse tour"}
        </div>
      </div>

      {/* titel */}
      <h3 className="mb-1 text-lg font-semibold text-slate-50">
        {tour.title}
      </h3>

      {/* korte intro */}
      {tour.overview_intro && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
          {tour.overview_intro}
        </p>
      )}

      {/* onderzijde: meta + CTA */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-slate-400">
        <div className="text-[11px] sm:text-xs">
          {metaText || "Tour met ongeveer acht werken"}
        </div>

        <Link
          href={`/tour/${tour.id}`}
          className="inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-amber-300"
        >
          Bekijk tour →
        </Link>
      </div>
    </article>
  );
}
