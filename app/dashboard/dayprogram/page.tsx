import { getSupabaseServer } from "@/lib/supabaseClient";

type SlotRow = {
  id?: string;
  day_date: string;
  content_type: "tour" | "focus" | "game";
  slot_index: number;
  content_id: string | null;
  is_premium: boolean;
  title?: string | null;
};

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function getDaySlots(dayDate: string) {
  const supabase = getSupabaseServer();
  const { data: slotsRaw } = await supabase
    .from("dayprogram_slots")
    .select("*")
    .eq("day_date", dayDate);

  const slots = (slotsRaw ?? []) as SlotRow[];

  const tourIds = slots
    .filter((s) => s.content_type === "tour" && s.content_id)
    .map((s) => s.content_id as string);
  const focusIds = slots
    .filter((s) => s.content_type === "focus" && s.content_id)
    .map((s) => s.content_id as string);
  const gameIds = slots
    .filter((s) => s.content_type === "game" && s.content_id)
    .map((s) => s.content_id as string);

  const [tours, focusItems, games] = await Promise.all([
    tourIds.length
      ? supabase.from("tours").select("id,title").in("id", tourIds)
      : Promise.resolve({ data: [] }),
    focusIds.length
      ? supabase.from("focus_items").select("id,title").in("id", focusIds)
      : Promise.resolve({ data: [] }),
    gameIds.length
      ? supabase.from("games").select("id,title").in("id", gameIds)
      : Promise.resolve({ data: [] }),
  ]);

  const titleById: Record<string, string> = {};
  (tours.data ?? []).forEach((t: any) => {
    titleById[t.id] = t.title ?? "Tour";
  });
  (focusItems.data ?? []).forEach((f: any) => {
    titleById[f.id] = f.title ?? "Focusmoment";
  });
  (games.data ?? []).forEach((g: any) => {
    titleById[g.id] = g.title ?? "Game";
  });

  return slots.map((s) => ({
    ...s,
    title: s.content_id ? titleById[s.content_id] ?? null : null,
  }));
}

export const metadata = {
  title: "Dagprogramma planner",
};

export default async function DayprogramDashboardPage() {
  const today = new Date();
  const dayDate = formatDate(today);
  const slots = await getDaySlots(dayDate);

  const byType: Record<"tour" | "focus" | "game", SlotRow[]> = {
    tour: [],
    focus: [],
    game: [],
  };
  slots.forEach((s) => {
    byType[s.content_type].push(s);
  });

  ["tour", "focus", "game"].forEach((t) => {
    byType[t as "tour" | "focus" | "game"].sort(
      (a, b) => a.slot_index - b.slot_index
    );
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">
          Dagprogramma voor vandaag
        </h1>
        <p className="text-sm text-zinc-400">
          Beheer de drie slots per type voor {dayDate}. Gebruik de knoppen om
          snel een voorstel of alternatief te genereren.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        {(["tour", "focus", "game"] as const).map((type) => (
          <div
            key={type}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3"
          >
            <h2 className="text-sm font-medium mb-2 uppercase tracking-wide text-zinc-300">
              {type === "tour"
                ? "Tours"
                : type === "focus"
                ? "Focusmomenten"
                : "Games"}
            </h2>
            <div className="flex gap-2">
              <form method="POST" action="/api/dayprogram/generate">
                <input type="hidden" name="dayDate" value={dayDate} />
                <input type="hidden" name="contentType" value={type} />
                <input type="hidden" name="mode" value="proposal" />
                <button className="rounded-lg border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800">
                  Genereer voorstel
                </button>
              </form>
              <form method="POST" action="/api/dayprogram/generate">
                <input type="hidden" name="dayDate" value={dayDate} />
                <input type="hidden" name="contentType" value={type} />
                <input type="hidden" name="mode" value="alternative" />
                <button className="rounded-lg border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-800">
                  Genereer alternatief
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        {(["tour", "focus", "game"] as const).map((type) => (
          <div
            key={type}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <h2 className="text-sm font-semibold mb-3 uppercase tracking-wide text-zinc-300">
              {type === "tour"
                ? "Tours"
                : type === "focus"
                ? "Focusmomenten"
                : "Games"}
            </h2>
            <div className="space-y-3 text-sm">
              {[1, 2, 3].map((slotIndex) => {
                const slot = byType[type].find(
                  (s) => s.slot_index === slotIndex
                );
                return (
                  <div
                    key={slotIndex}
                    className="flex items-center justify-between rounded-lg bg-zinc-900 px-3 py-2"
                  >
                    <div>
                      <div className="text-xs text-zinc-500 mb-0.5">
                        Slot {slotIndex}{" "}
                        {slotIndex === 1 ? "(gratis)" : "(premium)"}
                      </div>
                      <div className="font-medium text-zinc-100">
                        {slot?.title ?? "Nog geen content gekozen"}
                      </div>
                    </div>
                    {slot?.content_id && (
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        {type}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}