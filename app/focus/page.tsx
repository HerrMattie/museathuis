"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { RatingStars } from "@/components/RatingStars";

type LoadState = "idle" | "loading" | "loaded" | "empty" | "error";

type Slot = {
  id: string;
  slotIndex: number;
  isPremium: boolean;
  contentId: string;
};

type FocusMeta = {
  id: string;
  title: string;
  intro: string | null;
};

type Artwork = {
  id: string;
  title: string;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
  description: string | null;
};

export default function FocusTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [meta, setMeta] = useState<FocusMeta | null>(null);
  const [artwork, setArtwork] = useState<Artwork | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [ownRating, setOwnRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    void loadTodaySlots();
  }, []);

  useEffect(() => {
    if (!meta) return;
    void loadUserAndRating(meta.id);
  }, [meta?.id]);

  async function loadTodaySlots() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      const { data, error: slotsError } = await supabase
        .from("dayprogram_slots")
        .select("id, slot_index, is_premium, content_id")
        .eq("day_date", today)
        .eq("content_type", "focus")
        .order("slot_index", { ascending: true });

      if (slotsError) {
        console.error("Fout dayprogram_slots (focus):", slotsError);
        throw slotsError;
      }

      const rows = (data ?? []).filter((row: any) => row.content_id);
      if (rows.length === 0) {
        setState("empty");
        return;
      }

      const mapped: Slot[] = rows.map((row: any) => ({
        id: String(row.id),
        slotIndex: row.slot_index,
        isPremium: !!row.is_premium,
        contentId: String(row.content_id),
      }));

      setSlots(mapped);
      const first = mapped[0];
      setSelectedSlotIndex(first.slotIndex);
      await loadFocusById(first.contentId);
    } catch (e: any) {
      console.error("Fout bij laden focusslots:", e);
      setError("Het focusmoment van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadFocusById(focusId: string) {
    setState("loading");
    setError(null);
    setArtwork(null);

    try {
      const supabase = supabaseBrowser();

      const { data: focusRows, error: focusError } = await supabase
        .from("focus_items")
        .select("*")
        .eq("id", focusId)
        .limit(1);

      if (focusError) {
        console.error("Fout focus_items:", focusError);
        throw focusError;
      }

      const focus = focusRows && focusRows.length > 0 ? (focusRows[0] as any) : null;
      if (!focus) {
        setState("empty");
        return;
      }

      const focusMeta: FocusMeta = {
        id: String(focus.id),
        title: focus.title || "Focusmoment van vandaag",
        intro: focus.text || focus.description || null,
      };
      setMeta(focusMeta);

      const artworkId = focus.artwork_id || focus.artwork || null;
      if (artworkId) {
        const { data: artworkRows, error: artworkError } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", artworkId)
          .limit(1);

        if (artworkError) {
          console.error("Fout artworks:", artworkError);
          throw artworkError;
        }

        const art = artworkRows && artworkRows.length > 0 ? (artworkRows[0] as any) : null;
        if (art) {
          const mappedArtwork: Artwork = {
            id: String(art.id),
            title: art.title || "Onbekend kunstwerk",
            artist_name: art.artist_name || null,
            dating_text: art.dating_text || null,
            image_url: art.image_url || null,
            description: focusMeta.intro ?? art.description_primary ?? null,
          };
          setArtwork(mappedArtwork);
        }
      }

      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden focusmoment:", e);
      setError("Het focusmoment van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadUserAndRating(focusId: string) {
    try {
      setRatingLoading(true);
      setRatingError(null);

      const supabase = supabaseBrowser();
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userResult?.user ?? null;
      if (!user) {
        setUserId(null);
        setOwnRating(null);
        setRatingLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: ratingRows, error: ratingFetchError } = await supabase
        .from("focus_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("focus_id", focusId)
        .limit(1);

      if (ratingFetchError) throw ratingFetchError;

      const row = ratingRows && ratingRows.length > 0 ? ratingRows[0] : null;
      setOwnRating(row ? (row as any).rating : null);
      setRatingLoading(false);
    } catch (e: any) {
      console.error("Fout bij laden beoordeling focus:", e);
      setRatingError("Uw beoordeling kon niet worden geladen.");
      setRatingLoading(false);
    }
  }

  async function handleRatingChange(value: number) {
    if (!meta) return;

    try {
      setRatingLoading(true);
      setRatingError(null);

      const supabase = supabaseBrowser();
      const { data: userResult, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;
      const user = userResult?.user ?? null;

      if (!user) {
        window.location.href = "/auth/login?redirect=/focus";
        return;
      }

      const { error: upsertError } = await supabase.from("focus_ratings").upsert({
        user_id: user.id,
        focus_id: meta.id,
        rating: value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      setUserId(user.id);
      setOwnRating(value);
    } catch (e: any) {
      console.error("Fout bij opslaan beoordeling focus:", e);
      setRatingError("Uw beoordeling kon niet worden opgeslagen.");
    } finally {
      setRatingLoading(false);
    }
  }

  function renderSlotsSwitcher() {
    if (slots.length <= 1) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {slots.map((slot) => {
          const isActive = slot.slotIndex === selectedSlotIndex;
          const label =
            slot.slotIndex === 1
              ? "Gratis focusmoment"
              : `Premium focusmoment ${slot.slotIndex - 1}`;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotIndex(slot.slotIndex);
                void loadFocusById(slot.contentId);
              }}
              className={[
                "rounded-full border px-3 py-1.5",
                isActive
                  ? "border-amber-400 bg-amber-400/10 text-amber-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Focusmoment
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Focusmoment van vandaag"}
            </h1>

            {state === "loaded" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <RatingStars
                  value={ownRating}
                  onChange={(value) => void handleRatingChange(value)}
                  disabled={ratingLoading}
                  label="Uw beoordeling"
                />
                {!userId && !ratingLoading && (
                  <span className="text-[11px] text-slate-500">
                    Maak een gratis profiel aan om focusmomenten te beoordelen.
                  </span>
                )}
                {ratingError && (
                  <span className="text-[11px] text-red-300">
                    {ratingError}
                  </span>
                )}
              </div>
            )}

            {renderSlotsSwitcher()}
          </div>
          <div className="text-xs text-slate-400">
            <Link
              href="/"
              className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900"
            >
              Terug naar vandaag
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Het focusmoment van vandaag wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van het focusmoment."}
          </div>
        )}

        {state === "empty" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Er is voor vandaag nog geen focusmoment ingepland in het dagprogramma. Voeg in het CRM
            een focusmoment toe aan <code>dayprogram_slots</code> (type <code>focus</code>) om deze
            pagina te vullen.
          </div>
        )}

        {state === "loaded" && artwork && (
          <div className="space-y-4 rounded-3xl bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
              {artwork.image_url ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950/60">
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-950/40 text-xs text-slate-500">
                  Geen afbeelding beschikbaar
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-base font-semibold text-slate-50">
                  {artwork.title}
                </h2>
                {(artwork.artist_name || artwork.dating_text) && (
                  <p className="text-xs text-slate-400">
                    {artwork.artist_name && <span>{artwork.artist_name}</span>}
                    {artwork.artist_name && artwork.dating_text && <span> · </span>}
                    {artwork.dating_text && <span>{artwork.dating_text}</span>}
                  </p>
                )}
                {artwork.description && (
                  <p className="mt-2 whitespace-pre-line">{artwork.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
