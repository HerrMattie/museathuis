import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

type FocusBestRow = {
  focus_item_id: string;
  title: string | null;
  artwork_id: string | null;
  avg_rating: number | null;
  rating_count: number;
};

async function getBestFocus(): Promise<FocusBestRow[]> {
  const supabase = supabaseServer();

  const { data, error } = await (supabase
    .from("focus_best_of_week") as any)
    .select("*")
    .order("avg_rating", { ascending: false })
    .order("rating_count", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Fout bij laden best-of-focus:", error);
    return [];
  }

  return (data as any[]) ?? [];
}

export default async function BestOfPage() {
  const focus = await getBestFocus();

  return (
    <main className="px-6 py-10 max-w-4xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">
          Best of MuseaThuis
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Hoogst gewaardeerde focusmomenten van deze week
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Op basis van beoordelingen van gebruikers tonen we hier de best
          gewaardeerde focusmomenten van de afgelopen zeven dagen.
        </p>
      </header>

      {focus.length === 0 ? (
        <p className="text-sm text-slate-300">
          Er zijn nog geen beoordelingen genoeg om een toplijst te tonen. Zodra
          gebruikers focusmomenten beoordelen, verschijnen de toppers hier.
        </p>
      ) : (
        <section className="space-y-4">
          <ul className="space-y-2">
            {focus.map((item, index) => (
              <li
                key={item.focus_item_id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 w-6 text-right">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-slate-100">
                      {item.title || "Focusmoment zonder titel"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Gemiddelde beoordeling:{" "}
                      <span className="font-semibold">
                        {item.avg_rating?.toFixed(2) ?? "-"}
                      </span>{" "}
                      · {item.rating_count} beoordelingen
                    </div>
                  </div>
                </div>
                <Link
                  href="/focus"
                  className="text-[11px] font-medium text-amber-300 hover:text-amber-200"
                >
                  Bekijk focusmomenten
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}