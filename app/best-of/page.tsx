import { getSupabaseServer } from "@/lib/supabaseClient";

type BestOfRow = {
  tour_id?: string;
  game_id?: string;
  focus_item_id?: string;
  title: string;
  avg_rating: number;
  rating_count: number;
};

async function getBestOfData() {
  const supabase = getSupabaseServer();

  const [
    toursWeek,
    toursMonth,
    gamesWeek,
    gamesMonth,
    focusWeek,
    focusMonth,
  ] = await Promise.all([
    supabase.from("best_of_tours_week").select("*"),
    supabase.from("best_of_tours_month").select("*"),
    supabase.from("best_of_games_week").select("*"),
    supabase.from("best_of_games_month").select("*"),
    supabase.from("best_of_focus_week").select("*"),
    supabase.from("best_of_focus_month").select("*"),
  ]);

  return {
    toursWeek: (toursWeek.data ?? []) as BestOfRow[],
    toursMonth: (toursMonth.data ?? []) as BestOfRow[],
    gamesWeek: (gamesWeek.data ?? []) as BestOfRow[],
    gamesMonth: (gamesMonth.data ?? []) as BestOfRow[],
    focusWeek: (focusWeek.data ?? []) as BestOfRow[],
    focusMonth: (focusMonth.data ?? []) as BestOfRow[],
  };
}

export const metadata = {
  title: "Best of MuseaThuis",
};

export default async function BestOfPage() {
  const {
    toursWeek,
    toursMonth,
    gamesWeek,
    gamesMonth,
    focusWeek,
    focusMonth,
  } = await getBestOfData();

  const hasAnyData =
    toursWeek.length +
      toursMonth.length +
      gamesWeek.length +
      gamesMonth.length +
      focusWeek.length +
      focusMonth.length >
    0;

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Best of MuseaThuis</h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Overzicht van de hoogst gewaardeerde tours, games en focusmomenten op
          basis van beoordelingen in de huidige week en maand. Alleen items met
          voldoende stemmen worden getoond.
        </p>
      </header>

      {!hasAnyData ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
          Er zijn nog onvoldoende beoordelingen om een Best of overzicht te
          tonen. Nodig gebruikers uit om meer te beoordelen of vul eerst zelf
          wat testdata in.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <CategoryColumn
            title="Tours"
            week={toursWeek}
            month={toursMonth}
            label="tour"
          />
          <CategoryColumn
            title="Games"
            week={gamesWeek}
            month={gamesMonth}
            label="game"
          />
          <CategoryColumn
            title="Focusmomenten"
            week={focusWeek}
            month={focusMonth}
            label="focus"
          />
        </div>
      )}
    </main>
  );
}

function CategoryColumn({
  title,
  week,
  month,
  label,
}: {
  title: string;
  week: BestOfRow[];
  month: BestOfRow[];
  label: "tour" | "game" | "focus";
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-4">
        <BestOfList
          title="Deze week"
          items={week}
          emptyText={`Nog geen ${title.toLowerCase()} met voldoende beoordelingen deze week.`}
          label={label}
          period="week"
        />
        <BestOfList
          title="Deze maand"
          items={month}
          emptyText={`Nog geen ${title.toLowerCase()} met voldoende beoordelingen deze maand.`}
          label={label}
          period="month"
        />
      </div>
    </section>
  );
}

function BestOfList({
  title,
  items,
  emptyText,
  label,
  period,
}: {
  title: string;
  items: BestOfRow[];
  emptyText: string;
  label: "tour" | "game" | "focus";
  period: "week" | "month";
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
          {period}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-500">{emptyText}</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li
              key={
                item.tour_id || item.game_id || item.focus_item_id || index
              }
              className="flex items-center justify-between rounded-lg bg-zinc-900/80 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-300">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-100">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Gemiddelde beoordeling{" "}
                    <strong>{item.avg_rating.toFixed(2)}</strong> op basis van{" "}
                    <strong>{item.rating_count}</strong>{" "}
                    {item.rating_count === 1 ? "stem" : "stemmen"}.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                {label}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}