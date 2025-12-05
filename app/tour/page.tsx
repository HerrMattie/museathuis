"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";

type TourMeta = {
  id: string;
  title: string;
};

type TourArtwork = {
  id: string;
  title: string;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
  location_city: string | null;
  location_country: string | null;
  tour_text: string | null;
};

type LoadState = "idle" | "loading" | "loaded" | "error" | "empty";

export default function TourTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TourMeta | null>(null);
  const [items, setItems] = useState<TourArtwork[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    void loadTodayTour();
  }, []);

  async function loadTodayTour() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      const { data: scheduleRows, error: scheduleError } = await supabase
        .from("dayprogram_schedule")
        .select("tour_id")
        .eq("day_date", today)
        .limit(1);

      if (scheduleError) throw scheduleError;

      const tourId = scheduleRows && scheduleRows.length > 0 ? scheduleRows[0].tour_id : null;

      if (!tourId) {
        setState("empty");
        return;
      }

      const { data: tourRows, error: tourError } = await supabase
        .from("tours")
        .select("id, title")
        .eq("id", tourId)
        .limit(1);

      if (tourError) throw tourError;
      const tour = tourRows && tourRows.length > 0 ? tourRows[0] : null;

      if (!tour) {
        setState("empty");
        return;
      }

      const { data: itemRows, error: itemsError } = await supabase
        .from("tour_items")
        .select("id, artwork_id, order_index, tour_text")
        .eq("tour_id", tour.id)
        .order("order_index", { ascending: true });

      if (itemsError) throw itemsError;

      const artworkIds = (itemRows ?? [])
        .map((row: any) => row.artwork_id)
        .filter((id: any) => !!id);

      if (!artworkIds.length) {
        setMeta({ id: String(tour.id), title: tour.title ?? "Tour van vandaag" });
        setItems([]);
        setState("empty");
        return;
      }

      const { data: artworksData, error: artworksError } = await supabase
        .from("artworks")
        .select("id, title, artist_name, dating_text, image_url, location_city, location_country")
        .in("id", artworkIds);

      if (artworksError) throw artworksError;

      const artworkById = new Map<string, any>();
      (artworksData ?? []).forEach((a: any) => {
        artworkById.set(String(a.id), a);
      });

      const mappedItems: TourArtwork[] = (itemRows ?? []).map((row: any) => {
        const art = artworkById.get(String(row.artwork_id)) ?? {};
        return {
          id: String(row.id),
          title: art.title ?? "Onbenoemd kunstwerk",
          artist_name: art.artist_name ?? null,
          dating_text: art.dating_text ?? null,
          image_url: art.image_url ?? null,
          location_city: art.location_city ?? null,
          location_country: art.location_country ?? null,
          tour_text: row.tour_text ?? null,
        };
      });

      setMeta({ id: String(tour.id), title: tour.title ?? "Tour van vandaag" });
      setItems(mappedItems);
      setActiveIndex(0);
      setState(mappedItems.length ? "loaded" : "empty");
    } catch (e: any) {
      console.error("Fout bij laden dagtour:", e);
      setError("De tour van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  const active = items[activeIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Tour
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Tour van vandaag"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Een zorgvuldige selectie van kunstwerken om vandaag rustig thuis te bekijken. Blader
              met de pijlen en lees de toelichting onder elk werk.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <Link href="/" className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900">
              Terug naar vandaag
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            De tour van vandaag wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van de tour."}
          </div>
        )}

        {state === "empty" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Er is voor vandaag nog geen tour ingepland in het dagprogramma. Voeg in het CRM een tour
            toe aan de tabel <code>dayprogram_schedule</code> om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && active && (
          <div className="space-y-6">
            <section className="rounded-3xl bg-slate-900/80 p-4 sm:p-6 lg:p-8 shadow-xl shadow-black/40">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-900">
                  {active.image_url ? (
                    <Image
                      src={active.image_url}
                      alt={active.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      Geen afbeelding beschikbaar
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-400">
                    Werk {activeIndex + 1} van {items.length}
                  </div>
                  <h2 className="text-lg font-semibold text-slate-50">{active.title}</h2>
                  <div className="mt-1 text-sm text-slate-300">
                    {active.artist_name && <span>{active.artist_name}</span>}
                    {active.artist_name && active.dating_text && <span> · </span>}
                    {active.dating_text && <span>{active.dating_text}</span>}
                  </div>
                  {(active.location_city || active.location_country) && (
                    <div className="mt-1 text-xs text-slate-500">
                      {active.location_city && <span>{active.location_city}</span>}
                      {active.location_city && active.location_country && <span>, </span>}
                      {active.location_country && <span>{active.location_country}</span>}
                    </div>
                  )}

                  <div className="mt-4 flex-1 rounded-2xl bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-200">
                    {active.tour_text ? (
                      <p className="whitespace-pre-line">{active.tour_text}</p>
                    ) : (
                      <p className="text-slate-400">
                        Voor dit werk is nog geen uitgebreide toer-tekst ingevuld. Voeg in het CRM een
                        toelichting toe aan dit touritem om deze tekst hier te tonen.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
                        onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                        disabled={activeIndex === 0}
                      >
                        Vorig werk
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
                        onClick={() => setActiveIndex((i) => Math.min(items.length - 1, i + 1))}
                        disabled={activeIndex === items.length - 1}
                      >
                        Volgend werk
                      </button>
                    </div>
                    <div>
                      Werk {activeIndex + 1} van {items.length}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-900/60 p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                Overzicht van de tour
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`flex flex-col items-stretch overflow-hidden rounded-2xl border text-left text-xs transition ${
                      index === activeIndex
                        ? "border-amber-400 bg-slate-900"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="relative h-28 w-full bg-slate-950/60">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
                          Geen afbeelding
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                        Werk {index + 1}
                      </div>
                      <div className="line-clamp-2 text-[11px] font-semibold text-slate-50">
                        {item.title}
                      </div>
                      {item.artist_name && (
                        <div className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                          {item.artist_name}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
