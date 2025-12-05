// app/best-of/page.tsx
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function BestOfPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("v_best_of_museathuis")
    .select("*")
    .order("avg_rating", { ascending: false })
    .limit(30);

  return (
    <main className="max-w-5xl mx-auto py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold mb-2">Het beste van MuseaThuis</h1>
        <p className="text-sm text-muted-foreground">
          Tours, spellen en focusmomenten met de hoogste waarderingen.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {data?.map((item) => (
          <div
            key={`${item.content_type}-${item.content_id}`}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.content_type === "tour"
                ? "Tour"
                : item.content_type === "game"
                ? "Spel"
                : "Focusmoment"}
            </p>
            <h2 className="text-base font-medium">{item.title}</h2>
            {item.theme && (
              <p className="text-xs text-muted-foreground">
                Thema: {item.theme}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Gemiddelde waardering:{" "}
              <span className="font-semibold">
                {item.avg_rating ? item.avg_rating.toFixed(1) : "–"}
              </span>{" "}
              ({item.rating_count ?? 0} beoordelingen)
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
