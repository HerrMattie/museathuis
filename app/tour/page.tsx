// app/tour/page.tsx
import { supabaseServer } from "@/lib/supabaseClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DayProgramSlot = {
  id: string;
  day: string | null;
  content_id: string | null;
  slot_type: string | null; // "free" | "premium1" | "premium2" | ...
};

type TourRow = {
  id: string;
  title: string | null;
  intro: string | null;
  overview_intro: string | null;
  short_description: string | null;
  duration_min: number | null;
};

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) {
    return "Ongeveer 20–25 minuten";
  }
  if (minutes < 20) return `Ongeveer ${minutes} minuten`;
  return `Ongeveer ${minutes} minuten`;
}

function slotLabel(slotType: string | null | undefined): "Gratis" | "Premium" {
  if (!slotType) return "Gratis";
  return slotType === "free" ? "Gratis" : "Premium";
}

export default async function TourListPage() {
  const supabase = supabaseServer();

  // 1. Vandaag bepalen (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 2. Dagprogramma-slots voor tours ophalen
  const { data: slotData, error: slotError } = await supabase
    .from("day_program_slots")
    .select("id, day, content_id, slot_type, content_type")
    .eq("day", todayStr)
    .eq("content_type", "tour")
    .order("slot_type", { ascending: true });

  if (slotError) {
    console.error("Fout bij ophalen day_program_slots:", slotError);
  }

  const slots: DayProgramSlot[] =
    (slotData as DayProgramSlot[] | null) ?? [];

  const tourIds = slots
    .map((s) => s.content_id)
    .filter((id): id is string => !!id);

  // 3. Gekoppelde tours ophalen
  let toursById = new Map<string, TourRow>();

  if (tourIds.length > 0) {
    const { data: tourData, error: tourError } = await supabase
      .from("tours")
      .select(
        "id, title, intro, overview_intro, short_description, duration_min"
      )
      .in("id", tourIds);

    if (tourError) {
      console.error("Fout bij ophalen tours:", tourError);
    }

    const tours = (tourData as TourRow[] | null) ?? [];

    toursById = new Map<string, TourRow>(
      tours.map((t) => [t.id, t])
    );
  }

  // 4. Slots combineren met tour-gegevens en lege slots filteren
  const tourSlots = slots
    .map((slot) => {
      const tour = slot.content_id
        ? toursById.get(slot.content_id)
        : undefined;
      if (!tour) return null;
      return { slot, tour };
    })
    .filter(
      (item): item is { slot: DayProgramSlot; tour: TourRow } => item !== null
    );

  const hasTours = tourSlots.length > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
          Tours
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50">
              Ontdek de tours van vandaag
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Elke tour is een korte ontdekkingstocht langs ongeveer acht
              kunstwerken rond een thema, met toelichting in heldere
              museale taal. Kies een tour die past bij uw stemming of
              beschikbare tijd.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-emerald-200">
                ● Gratis tours
              </span>
              <span className="rounded-full bg-amber-900/40 px-3 py-1 text-amber-200">
                ● Premiumtours
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                ● Gemiddeld 20–25 minuten per tour
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <div className="font-semibold text-slate-200">
              Dagprogramma voor
            </div>
            <div>
              {new Intl.DateTimeFormat("nl-NL", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(today)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Huidige beschikbare tours
            </div>
          </div>
        </div>
      </header>

      {/* Geen dagprogramma / geen tours */}
      {!hasTours && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-sm text-slate-300">
          <p>
            Er is nog geen dagprogramma ingericht. Voeg eerst tours toe in
            het CRM-dagprogramma, of controleer of er tours zijn
            gekoppeld aan de tour-slots van vandaag.
          </p>
        </div>
      )}

      {/* Raster met tours */}
      {hasTours && (
        <>
          <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tourSlots.map(({ slot, tour }) => {
              const label = slotLabel(slot.slot_type);
              const isFree = label === "Gratis";
              const durationText = formatDuration(tour.duration_min);

              const description =
                tour.overview_intro ||
                tour.short_description ||
                tour.intro ||
                "Korte ontdekkingsreis langs een reeks kunstwerken rond een helder thema.";

              return (
                <article
                  key={slot.id}
                  className="flex flex-col rounded-2xl bg-slate-900/70 px-4 py-4 shadow-sm ring-1 ring-slate-800"
                >
                  <div className="mb-3 flex items-center justify-between text-[11px]">
                    <span
                      className={
                        "rounded-full px-3 py-1 font-semibold " +
                        (isFree
                          ? "bg-emerald-900/40 text-emerald-200"
                          : "bg-amber-900/40 text-amber-200")
                      }
                    >
                      {label}
                    </span>
                    <span className="text-slate-400">Dagelijkse tour</span>
                  </div>

                  <h2 className="text-base font-semibold text-slate-50">
                    {tour.title ?? "Tour"}
                  </h2>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-300">
                    {description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{durationText}</span>
                    <span>Ongeveer 8 werken</span>
                  </div>

                  <div className="mt-4 flex justify-end">
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

          <section className="mt-6 text-xs text-slate-400">
            In een latere fase wordt op deze pagina ook een archief met
            eerdere tours en thematische selecties zichtbaar. De huidige
            versie richt zich op het dagprogramma van vandaag.
          </section>
        </>
      )}
    </div>
  );
}
