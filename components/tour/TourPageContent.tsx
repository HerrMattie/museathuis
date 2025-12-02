// components/tour/TourPageContent.tsx
import { PremiumGate } from "@/components/premium/PremiumGate";

type Mode = "today" | "byId";

interface TourPageContentProps {
  mode: Mode;
  id?: string;
}

async function loadTour(mode: Mode, id?: string) {
  try {
    let url: string;

    if (mode === "today") {
      url = "/api/tours/today";
    } else if (mode === "byId" && id) {
      url = `/api/tours/${id}`;
    } else {
      return null;
    }

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      // Geen tour beschikbaar of serverfout
      return null;
    }

    const tour = await res.json();
    return tour;
  } catch {
    // Netwerk- of runtimefout: liever een nette fallback dan een throw
    return null;
  }
}

export async function TourPageContent(props: TourPageContentProps) {
  const tour = await loadTour(props.mode, props.id);

  if (!tour) {
    return (
      <article className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Tour van vandaag
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Nog geen tour beschikbaar
          </h1>
        </header>
        <p className="max-w-xl text-sm text-neutral-300">
          De tour van vandaag is nog niet beschikbaar of kon niet geladen
          worden. Zodra er een nieuwe tour gepland is, verschijnt deze hier.
        </p>
      </article>
    );
  }

  const items = (tour.tour_items ?? []).sort(
    (a: any, b: any) => a.position - b.position
  );

  return (
    <PremiumGate isPremiumRequired={tour.is_premium}>
      <article className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Tour van vandaag
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {tour.title}
          </h1>
          {tour.description && (
            <p className="max-w-2xl text-sm text-neutral-300">
              {tour.description}
            </p>
          )}
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              {items.length} kunstwerken · ongeveer 10 minuten luisteren
            </span>
          </div>
        </section>

        <section className="space-y-6">
          {items.map((item: any, index: number) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 md:grid-cols-[minmax(0,1.5fr),minmax(0,2fr)]"
            >
              <div className="space-y-2">
                <div className="aspect-[4/5] overflow-hidden rounded-md bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      item.artworks_enriched?.image_url ??
                      item.artworks_enriched?.image_thumbnail_url
                    }
                    alt={item.artworks_enriched?.title ?? "Kunstwerk"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-neutral-400">
                    Kunstwerk {index + 1} van {items.length}
                  </p>
                  <p className="text-sm font-medium text-neutral-100">
                    {item.artworks_enriched?.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {item.artworks_enriched?.artist_name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">{item.headline}</h2>
                  <p className="max-w-xl text-sm leading-relaxed text-neutral-200">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </article>
    </PremiumGate>
  );
}
