import { getSupabaseServer } from "@/lib/supabaseClient";

type DayprogramSlot = {
  day_date: string;
  content_type: "tour" | "focus" | "game";
  slot_index: number;
  is_premium: boolean;
  content_id: string | null;
};

export const metadata = {
  title: "MuseaThuis vandaag",
};

async function getTodayData() {
  const supabase = getSupabaseServer();
  const today = new Date();
  const dayDate = today.toISOString().slice(0, 10);

  const { data: slotsRaw } = await supabase
    .from("dayprogram_slots")
    .select("*")
    .eq("day_date", dayDate);

  const slots = (slotsRaw ?? []) as DayprogramSlot[];

  return {
    dayDate,
    slots,
  };
}

export default async function HomePage() {
  const { dayDate, slots } = await getTodayData();

  const byType: Record<"tour" | "focus" | "game", DayprogramSlot[]> = {
    tour: [],
    focus: [],
    game: [],
  };

  slots.forEach((s) => {
    if (s.content_type in byType) {
      byType[s.content_type].push(s);
    }
  });

  ["tour", "focus", "game"].forEach((t) => {
    byType[t as "tour" | "focus" | "game"].sort(
      (a, b) => a.slot_index - b.slot_index
    );
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-6 md:px-8">
        <h1 className="text-3xl font-semibold mb-2">MuseaThuis</h1>
        <p className="text-sm text-zinc-300 max-w-2xl">
          Dagelijkse tours, spellen en focusmomenten voor kunstliefhebbers
          thuis. Log in om je ervaring op te slaan, aanbevelingen te krijgen en
          premiumcontent te ontgrendelen.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <a
            href="/signup"
            className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-900"
          >
            Maak een gratis account
          </a>
          <a
            href="/login"
            className="rounded-lg border border-zinc-600 px-4 py-2"
          >
            Inloggen
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Vandaag voor jou • {dayDate}
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Drie slots per type: de eerste is gratis, twee zijn premium voor
          abonnees.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {(["tour", "focus", "game"] as const).map((type) => (
            <div
              key={type}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {type === "tour"
                    ? "Tours"
                    : type === "focus"
                    ? "Focusmomenten"
                    : "Games"}
                </h3>
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Vandaag
                </span>
              </div>
              <div className="space-y-3 text-sm">
                {[1, 2, 3].map((slotIndex) => {
                  const slot = byType[type].find(
                    (s) => s.slot_index === slotIndex
                  );
                  const isPremium = slotIndex > 1;
                  const href =
                    type === "tour"
                      ? `/tour/today/${slotIndex}`
                      : type === "focus"
                      ? `/focus/today/${slotIndex}`
                      : `/game/today/${slotIndex}`;
                  return (
                    <a
                      key={slotIndex}
                      href={href}
                      className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2 hover:bg-zinc-800"
                    >
                      <div>
                        <div className="text-xs text-zinc-500 mb-0.5">
                          Slot {slotIndex}{" "}
                          {isPremium ? "• Premium" : "• Gratis"}
                        </div>
                        <div className="font-medium text-zinc-100">
                          {slot?.content_id
                            ? "Geplande content"
                            : "Nog geen content gepland"}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        {type}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Ontdek de toppers</h2>
        <p className="text-sm text-zinc-400 mb-3">
          Bekijk welke tours, games en focusmomenten het hoogst gewaardeerd
          worden door andere gebruikers.
        </p>
        <a
          href="/best-of"
          className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
        >
          Naar Best of MuseaThuis
        </a>
      </section>
    </main>
  );
}