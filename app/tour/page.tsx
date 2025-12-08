// app/tour/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function ToursPage() {
  const supabase = supabaseServer();

  // 1. Meest recente dagprogramma ophalen
  const { data: program, error: programError } = await supabase
    .from("day_programs")
    .select("id, date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (programError || !program) {
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

  // 2. Slots voor dit dagprogramma, alleen type "tour"
  const { data: slots } = await supabase
    .from("day_program_slots")
    .select("id, slot_type, slot_index, content_type, content_id, is_premium")
    .eq("day_program_id", program.id)
    .eq("content_type", "tour")
    .order("slot_index", { ascending: true });

  const slotRows = slots ?? [];

  // 3. Bijbehorende tours ophalen
  const tourIds = Array.from(
    new Set(
      slotRows
        .map((s: any) => s.content_id)
        .filter((id: any): id is string => typeof id === "string")
    )
  );

  const toursById = new Map<string, any>();

  if (tourIds.length > 0) {
    const { data: tourRows } = await supabase
      .from("tours")
      .select(
        "id, title, overview_intro, short_description, duration_min, is_premium"
      )
      .in("id", tourIds);

    (tourRows ?? []).forEach((t: any) => {
      toursById.set(t.id, t);
    });
  }

  const tourSlots = slotRows
    .map((slot: any) => ({
      ...slot,
      tour: slot.content_id ? toursById.get(slot.content_id) : null,
    }))
    .filter((slot: any) => slot.tour);

  const date = program.date as string;
  const formatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = formatter.format(new Date(date));

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
          <div className="font-semibold text-slate-200">Dagprogramma voor</div>
          <div>{dateLabel}</div>
        </div>
      </div>

      {/* Tourtegels op basis van dagprogramma-slots */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {tourSlots.map((slot: any) => {
          const tour = slot.tour as any;
          const isPremium = slot.is_premium ?? tour.is_premium;
          const label = isPremium ? "Premium" : "Gratis";
          const labelClass = isPremium
            ? "bg-amber-400/10 text-amber-300 ring-amber-400/40"
            : "bg-emerald-400/10 text-emerald-300 ring-emerald-400/40";

          return (
            <div
              key={slot.id}
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
                  {tour.title}
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

      {tourSlots.length === 0 && (
        <p className="mt-8 text-sm text-slate-400">
          Er zijn nog geen tours aan het dagprogramma gekoppeld. Stel eerst de
          tour-slots in via het CRM-dagprogramma.
        </p>
      )}

      <p className="mt-10 text-xs text-slate-500">
        In een latere fase wordt op deze pagina ook een archief met eerdere
        tours en thematische selecties zichtbaar. De huidige versie richt zich
        op het dagprogramma van vandaag.
      </p>
    </div>
  );
}
