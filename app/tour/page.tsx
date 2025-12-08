// app/tour/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type TourRow = {
  id: string;
  date: string | null;
  title: string | null;
  overview_intro: string | null;
  short_description: string | null;
  duration_min: number | null;
  is_premium: boolean | null;
  status: string | null;
};

export default async function ToursPage() {
  const supabase = supabaseServer();

  // Eenvoudige, robuuste query: alle gepubliceerde tours tonen
  const { data, error } = await supabase
    .from("tours")
    .select(
      `
      id,
      date,
      title,
      overview_intro,
      short_description,
      duration_min,
      is_premium,
      status
    `
    )
    .eq("status", "published")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error loading tours:", error);
  }

  const tours: TourRow[] = (data ?? []) as TourRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Tours
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-50">
            Ontdek de tours van vandaag
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Elke tour is een korte ontdekkingstocht langs ongeveer acht
            kunstwerken rond een thema, met toelichting in heldere museale taal.
            Kies een tour die past bij uw stemming of beschikbare tijd.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">
              • Gratis tours
            </span>
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">
              • Premiumtours
            </span>
            <span className="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">
              • Gemiddeld 20–25 minuten per tour
            </span>
          </div>
        </div>

        {/* Eenvoudige placeholder rechtsboven, zonder koppeling aan dagprogramma */}
        <div className="text-right text-xs text-slate-400">
          <div className="font-semibold text-slate-200">Dagprogramma</div>
          <div>Huidige beschikbare tours</div>
        </div>
      </div>

      {/* Tourtegels */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tours.map((tour) => {
          const isPremium = !!tour.is_premium;
          const label = isPremium ? "Premium" : "Gratis";
          const labelClass = isPremium
            ? "bg-amber-400/10 text-amber-300 ring-amber-400/40"
            : "bg-emerald-400/10 text-emerald-300 ring-emerald-400/40";

          return (
            <div
              key={tour.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ring-1 ${labelClass}`}
                >
                  {label}
                </span>
                <span className="text-[11px] text-slate-500">
                  Dagelijkse tour
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-base font-semibold text-slate-50">
                  {tour.title ?? "Tour"}
                </h2>
                {tour.overview_intro && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                    {tour.overview_intro}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {tour.duration_min
                    ? `Ongeveer ${tour.duration_min} minuten • 8 werken`
                    : "Ongeveer 20–25 minuten • 8 werken"}
                </span>
                <Link
                  href={`/tour/${tour.id}`}
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200"
                >
                  Bekijk tour →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {tours.length === 0 && (
        <p className="mt-8 text-sm text-slate-400">
          Er zijn nog geen gepubliceerde tours beschikbaar. Maak eerst één of
          meer tours aan in het CRM.
        </p>
      )}

      <p className="mt-10 text-xs text-slate-500">
        In een latere fase kunnen we deze pagina koppelen aan het
        dagprogramma-schema, zodat u hier exact ziet welke tours vandaag in het
        dagprogramma zijn opgenomen.
      </p>
    </div>
  );
}
