// app/tour/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type DayProgram = {
  id: string;
};

type DayProgramSlot = {
  slot_index: number | null;
  is_premium: boolean | null;
  content_id: string | null;
  content_type: string | null;
};

type TourRow = {
  id: string;
  date: string | null;
  title: string | null;
  overview_intro: string | null;
  short_description: string | null;
  duration_min: number | null;
  status: string | null;
};

type TourWithSlot = TourRow & {
  slot_index: number;
  slot_is_premium: boolean;
};

export default async function ToursPage() {
  const supabase = supabaseServer();

  // 1. Bepaal "vandaag" in YYYY-MM-DD
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 2. Haal dagprogramma voor vandaag op
  const { data: program, error: programError } = await supabase
    .from("day_programs")
    .select("id")
    .eq("date", todayStr)
    .maybeSingle<DayProgram>();

  if (programError) {
    console.error("Error loading day program:", programError);
  }

  // Geen dagprogramma -> duidelijke melding
  if (!program) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Tours
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">
          Ontdek de tours van vandaag
        </h1>
        <p className="mt-4 text-sm text-slate-400">
          Er is nog geen dagprogramma ingericht. Voeg eerst tours toe in het
          CRM-dagprogramma.
        </p>
      </div>
    );
  }

  // 3. Haal de tourslots uit het dagprogramma
  const { data: slots, error: slotsError } = await supabase
    .from("day_program_slots")
    .select("slot_index, is_premium, content_id, content_type")
    .eq("day_program_id", program.id)
    .eq("content_type", "tour")
    .order("slot_index", { ascending: true });

  if (slotsError) {
    console.error("Error loading tour slots:", slotsError);
  }

  const tourSlots: DayProgramSlot[] = (slots ?? []).filter(
    (s): s is DayProgramSlot => !!s.content_id
  );

  // Geen tours in het dagprogramma
  if (tourSlots.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          Tours
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">
          Ontdek de tours van vandaag
        </h1>
        <p className="mt-4 text-sm text-slate-400">
          Het dagprogramma van vandaag bevat nog geen tours. Koppel in het CRM
          één of meer tours aan de tour-slots.
        </p>
      </div>
    );
  }

  const tourIds = tourSlots
    .map((s) => s.content_id)
    .filter((id): id is string => !!id);

  // 4. Haal de bijbehorende tours op
  const { data: toursData, error: toursError } = await supabase
    .from("tours")
    .select(
      `
      id,
      date,
      title,
      overview_intro,
      short_description,
      duration_min,
      status
    `
    )
    .in("id", tourIds)
    .eq("status", "published");

  if (toursError) {
    console.error("Error loading tours:", toursError);
  }

  const toursMap = new Map<string, TourRow>();
  (toursData ?? []).forEach((t) => {
    toursMap.set((t as TourRow).id, t as TourRow);
  });

  // 5. Combineer slots en tours, gesorteerd op slot_index
  const tours: TourWithSlot[] = tourSlots
    .map((slot) => {
      const tour = slot.content_id ? toursMap.get(slot.content_id) : undefined;
      if (!tour) return null;

      return {
        ...tour,
        slot_index: slot.slot_index ?? 0,
        slot_is_premium: !!slot.is_premium,
      } as TourWithSlot;
    })
    .filter((t): t is TourWithSlot => t !== null)
    .sort((a, b) => a.slot_index - b.slot_index);

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
            kunstwerken rond een thema, met toelichting in heldere museale
            taal. Kies een tour die past bij uw stemming of beschikbare tijd.
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

        <div className="text-right text-xs text-slate-400">
          <div className="font-semibold text-slate-200">Dagprogramma</div>
          <div>Huidige tours voor {todayStr}</div>
        </div>
      </div>

      {/* Tourtegels volgens dagprogramma-slots */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tours.map((tour) => {
          const isPremium = tour.slot_is_premium;
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
                {(tour.overview_intro || tour.short_description) && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                    {tour.overview_intro ?? tour.short_description}
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
          Het dagprogramma bevat op dit moment nog geen gepubliceerde tours.
        </p>
      )}
    </div>
  );
}
