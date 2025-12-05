// app/tour/today/page.tsx
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type TourResponse = {
  status: string;
  tour?: any;
  items?: any[];
};

export const dynamic = "force-dynamic";

async function fetchTodayTour(): Promise<TourResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tour/today`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function TodayTourPage() {
  const data = await fetchTodayTour();

  if (data.status !== "OK" || !data.tour) {
    return (
      <main className="max-w-5xl mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-4">Dagprogramma</h1>
        <p className="text-sm text-muted-foreground">
          Er is nog geen gepubliceerde tour voor vandaag.
        </p>
      </main>
    );
  }

  const { tour, items = [] } = data;

  return (
    <main className="max-w-5xl mx-auto py-12 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Dagelijkse tour · {tour.tour_date}
        </p>
        <h1 className="text-3xl font-semibold mb-2">{tour.title}</h1>
        {tour.theme && (
          <p className="text-sm text-muted-foreground mb-1">
            Thema: <span className="font-medium">{tour.theme}</span>
          </p>
        )}
        {tour.intro && (
          <p className="text-sm text-muted-foreground max-w-2xl">
            {tour.intro}
          </p>
        )}
        {tour.is_premium && (
          <p className="mt-2 text-xs inline-flex px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            Premiumtour
          </p>
        )}
      </header>

      <section className="space-y-10">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 items-start"
          >
            <div>
              {item.artwork?.image_url ? (
                <img
                  src={item.artwork.image_url}
                  alt={item.artwork.title ?? "Kunstwerk"}
                  className="w-full rounded-xl object-contain bg-slate-900"
                />
              ) : (
                <div className="aspect-[4/3] rounded-xl bg-slate-900/60" />
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Kunstwerk {index + 1} van {items.length}
              </p>
              <h2 className="text-xl font-semibold">
                {item.artwork?.title ?? "Zonder titel"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {item.artwork?.artist_name && (
                  <>
                    {item.artwork.artist_name}
                    {" · "}
                  </>
                )}
                {item.artwork?.dating_text}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.artwork?.museum}
                {item.artwork?.location_city && ` · ${item.artwork.location_city}`}
                {item.artwork?.location_country &&
                  `, ${item.artwork.location_country}`}
              </p>
              {item.generated_text && (
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {item.generated_text}
                </p>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
