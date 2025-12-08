// app/tour/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type TourRow = {
  id: string;
  title: string;
  intro: string | null;
  short_description: string | null;
  is_premium: boolean | null;
  duration_min: number | null;
  date: string | null;
  status: string | null;
};

export default async function TourListPage() {
  const supabase = supabaseServer();

  // -----------------------------------------------------------
  // 1. Bepaal "vandaag" (ISO date) voor dagprogramma
  // -----------------------------------------------------------
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const dateLabel = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(today);

  // -----------------------------------------------------------
  // 2. Probeer het dagprogramma voor vandaag op te halen
  //    Let op: als de tabel/kolommen anders heten krijg je alleen
  //    een Supabase-error, maar de pagina valt dan terug op
  //    alle gepubliceerde tours.
  // -----------------------------------------------------------
  let scheduledTourIds: string[] = [];
  let hasSchedule = false;

  try {
    const { data: slotRows, error: slotError } = await supabase
      .from("day_program_slots") // <- als dit anders heet, blijft alles gewoon werken via de fallback
      .select("content_id, content_type, slot_type")
      .eq("program_date", todayIso)
      .eq("content_type", "tour")
      .order("slot_type", { ascending: true });

    if (!slotError && slotRows && slotRows.length > 0) {
      scheduledTourIds = slotRows
        .map((row: any) => row.content_id)
        .filter((id: any): id is string => typeof id === "string");
      hasSchedule = scheduledTourIds.length > 0;
    }
  } catch {
    // Geen harde error gooien; gewoon fallback gebruiken
    hasSchedule = false;
    scheduledTourIds = [];
  }

  // -----------------------------------------------------------
  // 3. Haal tours op
  //    - Als er een dagprogramma is: alleen die tours.
  //    - Zo niet: alle gepubliceerde tours.
  // -----------------------------------------------------------
  let query = supabase
    .from("tours")
    .select<
      TourRow[
        "id" | "title" | "intro" | "short_description" | "is_premium" | "duration_min" | "date" | "status"
      ]
    >(
      `
      id,
      title,
      intro,
      short_description,
      is_premium,
      duration_min,
      date,
      status
    `
    )
    .eq("status", "published");

  if (hasSchedule && scheduledTourIds.length > 0) {
    query = query.in("id", scheduledTourIds);
  }

  const { data: toursData, error: toursError } = await query;

  const tours: TourRow[] = Array.isArray(toursData) ? toursData : [];

  // -----------------------------------------------------------
  // 4. UI
  // -----------------------------------------------------------
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
          Tours
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
            Ontdek de tours van vandaag
          </h1>
          <div className="text-right text-xs text-slate-400 sm:text-sm">
            <div className="font-medium text-slate-200">Dagprogramma voor</div>
            <div>{dateLabel}</div>
            {hasSchedule && (
              <div className="text-[11px] text-emerald-400">
                Tours uit het CRM-dagprogramma
              </div>
            )}
            {!hasSchedule && (
              <div className="text-[11px] text-slate-500">
                Geen dagprogramma gevonden, alle gepubliceerde tours
              </div>
            )}
          </div>
        </div>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke tour is een korte ontdekkingstocht langs ongeveer acht kunstwerken
          rond een thema, met toelichting in heldere museale taal. Kies een tour
          die past bij uw stemming of beschikbare tijd.
        </p>

        {/* Static badges (voor nu alleen visueel) */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            ● Gratis tours
          </span>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300">
            ● Premiumtours
          </span>
          <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-slate-300">
            ● Gemiddeld 20–25 minuten per tour
          </span>
        </div>
      </header>

      {/* GEEN TOURS */}
      {(toursError || tours.length === 0) && (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-sm text-slate-300">
          Er zijn vandaag nog geen tours beschikbaar. Controleer in het
          CRM-dagprogramma of er tours zijn gekoppeld, of publiceer nieuwe
          tours in het CRM.
        </div>
      )}

      {/* TOURKAARTEN */}
      {tours.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => {
            const isPremium = !!tour.is_premium;
            const durationLabel =
              tour.duration_min != null
                ? `Ongeveer ${tour.duration_min} minuten • ca. 8 werken`
                : "Ongeveer 20–25 minuten • ca. 8 werken";

            return (
              <article
                key={tour.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    <span
                      className={
                        isPremium
                          ? "rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300"
                          : "rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300"
                      }
                    >
                      {isPremium ? "Premium" : "Gratis"}
                    </span>
                    <span>Dagelijkse tour</span>
                  </div>

                  <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
                    {tour.title}
                  </h2>

                  <p className="line-clamp-3 text-sm text-slate-300">
                    {tour.short_description || tour.intro || "Korte tourbeschrijving volgt."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{durationLabel}</span>
                  <Link
                    href={`/tour/${tour.id}`}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200"
                  >
                    Bekijk tour →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* VOETTEKST */}
      <footer className="mt-4 text-xs text-slate-500">
        In een latere fase koppelen we deze pagina 1-op-1 aan het
        dagprogramma-schema, zodat u hier exact ziet welke tours vandaag in het
        dagprogramma zijn opgenomen.
      </footer>
    </div>
  );
}
