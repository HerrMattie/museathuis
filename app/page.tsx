import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

type DayprogramRow = {
  day_date: string;
  content_type: "tour" | "focus" | "game";
  slot_index: number;
  content_id: string | null;
  is_premium: boolean | null;
  content_title: string | null;
};

async function getTodayProgram(): Promise<{
  tours: DayprogramRow[];
  focus: DayprogramRow[];
  games: DayprogramRow[];
}> {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await (supabase
    .from("dayprogram_overview") as any)
    .select("*")
    .eq("day_date", today)
    .order("slot_index", { ascending: true });

  if (error) {
    console.error("Fout bij laden dagprogramma:", error);
    return { tours: [], focus: [], games: [] };
  }

  const rows = (data as any[]) ?? [];
  return {
    tours: rows.filter((r) => r.content_type === "tour"),
    focus: rows.filter((r) => r.content_type === "focus"),
    games: rows.filter((r) => r.content_type === "game"),
  };
}

function slotLabel(slotIndex: number, contentType: "tour" | "focus" | "game") {
  const base =
    contentType === "tour"
      ? "tour"
      : contentType === "focus"
      ? "focusmoment"
      : "game";

  if (slotIndex === 1) return `Slot 1 · Gratis ${base}`;
  if (slotIndex === 2) return "Slot 2 · Premium";
  if (slotIndex === 3) return "Slot 3 · Premium";
  return `Slot ${slotIndex}`;
}

function slotHref(contentType: "tour" | "focus" | "game", slotIndex: number) {
  if (contentType === "tour") return `/tour/today/${slotIndex}`;
  if (contentType === "focus") return `/focus/today/${slotIndex}`;
  return `/game/today/${slotIndex}`;
}

function renderSlot(
  rows: DayprogramRow[],
  contentType: "tour" | "focus" | "game",
  slotIndex: number
) {
  const slot = rows.find((r) => r.slot_index === slotIndex);

  const title =
    slot && slot.content_id
      ? slot.content_title || "Geplande content"
      : "Nog geen content gepland";

  const href =
    slot && slot.content_id ? slotHref(contentType, slotIndex) : null;

  const label = slotLabel(slotIndex, contentType);

  const inner = (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-100 truncate">
        {title}
      </div>
    </div>
  );

  if (!href) {
    return (
      <div
        key={slotIndex}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      key={slotIndex}
      href={href}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 hover:border-amber-400/70 hover:bg-slate-900 transition"
    >
      {inner}
    </Link>
  );
}

export default async function HomePage() {
  const { tours, focus, games } = await getTodayProgram();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="px-6 py-10 max-w-6xl mx-auto space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-8 md:px-10 md:py-10 space-y-4">
        <div className="text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">
          MuseaThuis
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Dagelijkse tours, spellen en focusmomenten voor kunstliefhebbers thuis.
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl">
          Maak een gratis profiel aan, ontdek elke dag nieuwe kunstwerken en
          ontgrendel premiumtours en -spellen met een abonnement.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-slate-900 hover:bg-amber-300"
          >
            Maak een gratis account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-slate-600 px-5 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            Inloggen
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-50">
              Vandaag voor jou · {today}
            </h2>
            <p className="text-xs text-slate-400">
              Drie slots per type: de eerste is gratis, twee zijn premium voor abonnees.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
            <header className="flex items-baseline justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Tours</h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                  Vandaag
                </p>
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                TOUR
              </span>
            </header>
            <div className="space-y-2">
              {[1, 2, 3].map((slotIndex) =>
                renderSlot(tours, "tour", slotIndex)
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
            <header className="flex items-baseline justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Focusmomenten
                </h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                  Vandaag
                </p>
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                FOCUS
              </span>
            </header>
            <div className="space-y-2">
              {[1, 2, 3].map((slotIndex) =>
                renderSlot(focus, "focus", slotIndex)
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
            <header className="flex items-baseline justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Games</h3>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                  Vandaag
                </p>
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                GAME
              </span>
            </header>
            <div className="space-y-2">
              {[1, 2, 3].map((slotIndex) =>
                renderSlot(games, "game", slotIndex)
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-50">Ontdek de toppers</h2>
        <p className="text-sm text-slate-300 max-w-xl">
          Bekijk welke tours, games en focusmomenten het hoogst gewaardeerd worden
          door andere gebruikers.
        </p>
        <Link
          href="/best-of"
          className="inline-flex items-center rounded-full border border-slate-600 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          Naar Best of MuseaThuis
        </Link>
      </section>
    </main>
  );
}