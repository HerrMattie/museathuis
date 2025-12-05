// app/tour/page.tsx
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function TourOverviewPage() {
  const supabase = getSupabaseServerClient();

  const { data: tours } = await supabase
    .from("tours")
    .select("id, tour_date, title, theme, is_premium, status")
    .order("tour_date", { ascending: false })
    .limit(30);

  return (
    <main className="max-w-5xl mx-auto py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold mb-2">Tours</h1>
        <p className="text-sm text-muted-foreground">
          Overzicht van recente dagtours. Gepubliceerde tours zijn ook
          terug te kijken.
        </p>
      </header>

      <section className="grid gap-4">
        {tours?.map((tour) => (
          <a
            key={tour.id}
            href="/tour/today?date="
            className="block rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 hover:border-slate-600"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {tour.tour_date} · {tour.status}
                </p>
                <p className="text-base font-medium">{tour.title}</p>
                {tour.theme && (
                  <p className="text-xs text-muted-foreground">
                    Thema: {tour.theme}
                  </p>
                )}
              </div>
              {tour.is_premium && (
                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border border-yellow-500/40 text-yellow-400">
                  Premium
                </span>
              )}
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
