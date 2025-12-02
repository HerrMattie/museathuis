// components/tour/TodayTourPreview.tsx
import Link from "next/link";

export async function TodayTourPreview() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/tours/today`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-red-300">
        Er ging iets mis bij het laden van de tour van vandaag.
      </div>
    );
  }

  const tour = await res.json();

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{tour.title}</h2>
          {tour.description && (
            <p className="max-w-xl text-sm text-neutral-300">
              {tour.description}
            </p>
          )}
        </div>
        <Link
          href="/tour/today"
          className="inline-flex items-center justify-center rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
        >
          Start tour van vandaag
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(tour.tour_items ?? []).slice(0, 4).map((item: any) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-950"
          >
            {item.artworks_enriched?.image_thumbnail_url && (
              <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.artworks_enriched.image_thumbnail_url}
                  alt={item.artworks_enriched.title ?? "Kunstwerk"}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-2">
              <p className="truncate text-xs text-neutral-200">
                {item.artworks_enriched?.title}
              </p>
              <p className="truncate text-[11px] text-neutral-400">
                {item.artworks_enriched?.artist_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
