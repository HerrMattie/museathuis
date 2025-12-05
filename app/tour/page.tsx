"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";

type ArtworkSummary = {
  id: string;
  title: string | null;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
  location_city: string | null;
  location_country: string | null;
};

type TourItem = {
  id: string;
  position: number | null;
  artwork: ArtworkSummary | null;
};

type TourMeta = {
  id: string;
  title: string | null;
  primary_theme: string | null;
  level: number | null;
  is_premium: boolean;
  duration_minutes: number | null;
};

type TourTodayResponse = {
  tour: TourMeta | null;
  items: TourItem[];
  averageRating: number | null;
  ratingCount: number;
};

function formatLevel(level: number | null): string {
  if (!level) return "";
  if (level === 1) return "Niveau 1 · kennismaking";
  if (level === 2) return "Niveau 2 · verdieping";
  return `Niveau ${level}`;
}

function formatDuration(durationMinutes: number | null): string {
  if (!durationMinutes) return "";
  return `${durationMinutes} minuten`;
}

function formatLocation(city: string | null, country: string | null): string {
  if (!city && !country) return "";
  if (city && country) return `${city}, ${country}`;
  return city || country || "";
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 text-amber-300">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const filled = value !== null && starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            className={[
              "h-6 w-6 rounded-full border border-transparent text-sm leading-none",
              filled ? "text-amber-300" : "text-slate-500",
              disabled ? "cursor-not-allowed opacity-60" : "hover:text-amber-200",
            ].join(" ")}
            onClick={() => !disabled && onChange(starValue)}
            aria-label={`${starValue} sterren`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function TourPage() {
  const [loading, setLoading] = useState(true);
  const [tourData, setTourData] = useState<TourTodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  const supabase = supabaseBrowser;

  useEffect(() => {
    async function loadTour() {
      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().slice(0, 10);

        // 1. Zoek de dagtour in dayprogram_schedule
        const { data: dayRow, error: dayError } = await supabase
          .from("dayprogram_schedule")
          .select("tour_id")
          .eq("day_date", today)
          .eq("is_primary_tour", true)
          .maybeSingle();

        if (dayError) {
          console.error("Error loading dayprogram_schedule", dayError);
          setError("De dagtour kon niet worden opgehaald.");
          setLoading(false);
          return;
        }

        if (!dayRow || !dayRow.tour_id) {
          setError("Er is nog geen tour ingepland voor vandaag.");
          setLoading(false);
          return;
        }

        const tourId = dayRow.tour_id as string;

        // 2. Haal tourmeta op
        const { data: tour, error: tourError } = await supabase
          .from("tours")
          .select(
            "id, title, primary_theme, level, is_premium, duration_minutes"
          )
          .eq("id", tourId)
          .maybeSingle();

        if (tourError) {
          console.error("Error loading tour", tourError);
          setError("De dagtour kon niet worden geladen.");
          setLoading(false);
          return;
        }

        if (!tour) {
          setError("De dagtour bestaat niet meer in de database.");
          setLoading(false);
          return;
        }

        const tourMeta: TourMeta = {
          id: tour.id,
          title: tour.title,
          primary_theme: tour.primary_theme,
          level: tour.level,
          is_premium: tour.is_premium ?? false,
          duration_minutes: tour.duration_minutes,
        };

        // 3. Haal tour_items op
        const { data: items, error: itemsError } = await supabase
          .from("tour_items")
          .select("id, position, artwork_id")
          .eq("tour_id", tourId)
          .order("position", { ascending: true });

        if (itemsError) {
          console.error("Error loading tour_items", itemsError);
          setError("De werken in deze tour konden niet worden geladen.");
          setLoading(false);
          return;
        }

        const artworkIds = (items ?? [])
          .map((it: any) => it.artwork_id)
          .filter(Boolean);

        let artworksById: Record<string, ArtworkSummary> = {};

        if (artworkIds.length > 0) {
          const { data: artworks, error: artworksError } = await supabase
            .from("artworks")
            .select(
              "id, title, artist_name, dating_text, image_url, location_city, location_country"
            )
            .in("id", artworkIds as string[]);

          if (artworksError) {
            console.error("Error loading artworks", artworksError);
          } else {
            artworksById = (artworks ?? []).reduce(
              (acc: Record<string, ArtworkSummary>, a: any) => {
                acc[a.id] = {
                  id: a.id,
                  title: a.title,
                  artist_name: a.artist_name,
                  dating_text: a.dating_text,
                  image_url: a.image_url,
                  location_city: a.location_city,
                  location_country: a.location_country,
                };
                return acc;
              },
              {}
            );
          }
        }

        const tourItems: TourItem[] = (items ?? []).map((it: any) => ({
          id: it.id,
          position: it.position,
          artwork: it.artwork_id ? artworksById[it.artwork_id] ?? null : null,
        }));

        // 4. Ratings voor deze tour ophalen
        const { data: ratings, error: ratingsError } = await supabase
          .from("tour_ratings")
          .select("rating")
          .eq("tour_id", tourId);

        if (ratingsError) {
          console.error("Error loading tour_ratings", ratingsError);
        }

        let avg: number | null = null;
        let count = 0;
        if (ratings && ratings.length > 0) {
          count = ratings.length;
          const sum = ratings.reduce(
            (acc: number, r: any) => acc + (r.rating ?? 0),
            0
          );
          avg = sum / ratings.length;
        }

        // 5. Eigen rating ophalen (indien ingelogd)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: myRating, error: myRatingError } = await supabase
            .from("tour_ratings")
            .select("rating")
            .eq("tour_id", tourId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (!myRatingError && myRating) {
            setUserRating(myRating.rating ?? null);
          }
        }

        setTourData({
          tour: tourMeta,
          items: tourItems,
          averageRating: avg,
          ratingCount: count,
        });
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het laden van de dagtour.");
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [supabase]);

  const ratingSummaryText = useMemo(() => {
    if (!tourData) return "";
    const { averageRating, ratingCount } = tourData;
    if (!ratingCount || !averageRating) return "Nog geen beoordelingen.";
    const rounded = Math.round(averageRating * 10) / 10;
    return `${rounded.toString().replace(".", ",")} op 5 (${ratingCount} beoordeling${ratingCount === 1 ? "" : "en"})`;
  }, [tourData]);

  async function handleChangeRating(newRating: number) {
    if (!tourData?.tour) return;

    try {
      setSavingRating(true);
      setNeedsProfile(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNeedsProfile(true);
        return;
      }

      const { error: upsertError } = await supabase
        .from("tour_ratings")
        .upsert(
          {
            user_id: user.id,
            tour_id: tourData.tour.id,
            rating: newRating,
          },
          {
            onConflict: "user_id,tour_id",
          }
        );

      if (upsertError) {
        console.error("Error saving rating", upsertError);
        setError("Je beoordeling kon niet worden opgeslagen.");
        return;
      }

      setUserRating(newRating);

      // Optioneel: ratingSummary opnieuw ophalen in een latere iteratie
    } catch (e) {
      console.error(e);
      setError("Er ging iets mis bij het opslaan van je beoordeling.");
    } finally {
      setSavingRating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-slate-200">
        <p className="text-xs text-slate-400">Dagtour wordt geladen…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-slate-200">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Tour van vandaag
        </h1>
        <p className="text-xs text-red-300">{error}</p>
      </div>
    );
  }

  if (!tourData || !tourData.tour) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-slate-200">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Tour van vandaag
        </h1>
        <p className="text-xs text-slate-400">
          Er is nog geen tour ingepland voor vandaag.
        </p>
      </div>
    );
  }

  const { tour, items } = tourData;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-slate-200">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Vandaag
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          {tour.title || "Tour van vandaag"}
        </h1>
        {tour.primary_theme && (
          <p className="text-xs font-medium text-slate-300">
            {tour.primary_theme}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          {formatLevel(tour.level) && (
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {formatLevel(tour.level)}
            </span>
          )}
          {formatDuration(tour.duration_minutes) && (
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {formatDuration(tour.duration_minutes)}
            </span>
          )}
          <span className="rounded-full border border-slate-700 px-3 py-1">
            {tour.is_premium ? "Premiumtour" : "Gratis tour"}
          </span>
          {ratingSummaryText && (
            <span className="rounded-full border border-slate-700 px-3 py-1">
              {ratingSummaryText}
            </span>
          )}
        </div>
        <p className="max-w-2xl text-sm text-slate-300">
          Deze pagina toont de dagtour zoals die in het dagprogramma is
          geselecteerd. Alle werken delen één thematische rode draad; niveau 1
          en 2 geven alleen de diepgang van de uitleg aan.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Werken in deze tour
        </h2>
        {items.length === 0 && (
          <p className="text-xs text-slate-400">
            Er zijn nog geen werken gekoppeld aan deze tour.
          </p>
        )}
        <ol className="space-y-4">
          {items.map((item, index) => {
            const artwork = item.artwork;
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row"
              >
                <div className="flex-shrink-0">
                  {artwork?.image_url ? (
                    <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-slate-900">
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title || "Kunstwerk"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900 text-[11px] text-slate-500">
                      Geen afbeelding
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Werk {index + 1}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-50">
                        {artwork?.title || "Titel onbekend"}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {artwork?.artist_name || "Onbekende kunstenaar"}
                        {artwork?.dating_text ? ` · ${artwork.dating_text}` : ""}
                      </p>
                      {formatLocation(
                        artwork?.location_city ?? null,
                        artwork?.location_country ?? null
                      ) && (
                        <p className="text-[11px] text-slate-400">
                          {formatLocation(
                            artwork?.location_city ?? null,
                            artwork?.location_country ?? null
                          )}
                        </p>
                      )}
                    </div>
                    {item.position !== null && (
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-400">
                        {item.position}/{items.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    In een volgende fase komt hier de daadwerkelijke tourtekst
                    (ongeveer drie minuten audio per werk), waarin dit werk in
                    relatie tot het tourthema wordt besproken.
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Hoe waardeert u deze tour?
        </h2>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-300">
              Geef een beoordeling van 1 tot 5 sterren. Met een gratis profiel
              kunt u tours waarderen; deze gegevens worden anoniem gebruikt voor
              “Best of MuseaThuis” en analyses voor musea.
            </p>
            {needsProfile && (
              <p className="text-xs text-amber-300">
                Maak eerst een gratis profiel aan of log in om een beoordeling
                te kunnen geven.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StarRating
              value={userRating}
              onChange={handleChangeRating}
              disabled={savingRating}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
