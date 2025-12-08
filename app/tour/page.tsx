
import Link from "next/link";

export const dynamic = "force-dynamic";

type TourSummary = {
  id: string;
  title: string;
  subtitle?: string | null;
  overview_intro?: string | null;
  is_premium?: boolean | null;
  publish_date?: string | null;
};

type TourTodayResponse =
  | {
      status: "ok";
      meta?: {
        date?: string;
      } | null;
      items: TourSummary[];
    }
  | {
      status: "error";
      error: string;
    };

async function fetchToursToday(): Promise<TourTodayResponse> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/tour/today`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        status: "error",
        error: `HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as TourTodayResponse;
    if (!data || !("status" in data)) {
      return { status: "error", error: "Onverwachte API-respons" };
    }
    return data;
  } catch (err: any) {
    return {
      status: "error",
      error: err?.message ?? "Onbekende fout bij ophalen van tours",
    };
  }
}

export default async function TourOverviewPage() {
  const result = await fetchToursToday();

  const today =
    result.status === "ok" && result.meta?.date
      ? new Date(result.meta.date)
      : new Date();

  const dateLabel = today.toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const items = result.status === "ok" ? result.items : [];

  const hasFree = items.some((t) => !t.is_premium);
  const hasPremium = items.some((t) => t.is_premium);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Hero / uitleg */}
        <section className="space-y-3">
          <p className="text-xs tracking-[0.25em] uppercase text-yellow-400">
            Tours
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">
                Ontdek de tours van vandaag
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-2xl">
                Elke tour is een korte ontdekkingstocht langs ongeveer acht
                kunstwerken rond een thema, met toelichting in heldere museale
                taal. Kies een tour die past bij uw stemming of beschikbare
                tijd.
              </p>
            </div>
            <div className="text-xs text-right text-gray-400">
              <div className="font-medium text-gray-200">
                Dagprogramma voor
              </div>
              <div>{dateLabel}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-300">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Gratis tours</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span>Premiumtours</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1">
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-gray-500" />
              <span>Gemiddeld 20–25 minuten per tour</span>
            </div>
          </div>
        </section>

        {/* Foutstate */}
        {result.status === "error" && (
          <section className="rounded-2xl border border-red-500 bg-[#220000] px-4 py-3 text-sm text-red-100">
            <p className="font-medium mb-1">Kon de tours van vandaag niet laden.</p>
            <p className="text-xs text-red-200">
              Probeer de pagina opnieuw te laden. Foutmelding: {result.error}.
            </p>
          </section>
        )}

        {/* Geen tours */}
        {result.status === "ok" && items.length === 0 && (
          <section className="rounded-2xl border border-gray-800 bg-black/40 px-5 py-6 text-sm text-gray-300">
            <p className="font-medium mb-1">Er zijn nog geen tours ingepland voor vandaag.</p>
            <p className="text-xs text-gray-400 max-w-xl">
              De redactie stelt het dagprogramma meestal een dag van tevoren
              samen. Kom later nog eens terug, of bekijk het aanbod via de
              andere onderdelen van MuseaThuis.
            </p>
          </section>
        )}

        {/* Lijst met tours */}
        {result.status === "ok" && items.length > 0 && (
          <section className="grid gap-5 md:grid-cols-3">
            {items.map((tour) => {
              const isPremium = !!tour.is_premium;

              return (
                <article
                  key={tour.id}
                  className="flex flex-col rounded-3xl border border-gray-800 bg-[#020617] p-5 shadow-sm hover:border-yellow-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        isPremium
                          ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/60"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/60"
                      }`}
                    >
                      {isPremium ? "Premium" : "Gratis"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {tour.publish_date
                        ? new Date(tour.publish_date).toLocaleDateString(
                            "nl-NL"
                          )
                        : "Dagelijkse tour"}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold leading-snug">
                    {tour.title}
                  </h2>
                  {tour.subtitle && (
                    <p className="mt-1 text-xs text-gray-300">{tour.subtitle}</p>
                  )}

                  <p className="mt-3 text-sm text-gray-300 line-clamp-3">
                    {tour.overview_intro ??
                      "Korte ontdekkingsreis langs ongeveer acht kunstwerken rond een helder thema."}
                  </p>

                  <div className="mt-4 flex-1" />

                  <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-400">
                      Ongeveer 20–25 minuten • 8 werken
                    </span>
                    <Link
                      href={`/tour/${tour.id}`}
                      className="inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200 font-medium"
                    >
                      Bekijk tour
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Kleine toelichting onderaan */}
        <section className="mt-4 text-xs text-gray-400 max-w-2xl">
          <p>
            In een latere fase wordt op deze pagina ook een archief met eerdere
            tours en thematische selecties zichtbaar. De huidige versie richt
            zich op het dagprogramma van vandaag.
          </p>
        </section>
      </div>
    </main>
  );
}
