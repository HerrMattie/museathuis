"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { RatingStars } from "@/components/RatingStars";

type LoadState = "idle" | "loading" | "loaded" | "empty" | "error";

type Slot = {
  id: string;
  slotIndex: number;
  isPremium: boolean;
  contentId: string;
};

type GameMeta = {
  id: string;
  title: string;
  intro: string | null;
  game_type: string | null;
  instructions: string | null;
};

export default function GameTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [meta, setMeta] = useState<GameMeta | null>(null);

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
        .eq("content_type", "game")
        .order("slot_index", { ascending: true });

      if (slotsError) {
        console.error("Fout dayprogram_slots (game):", slotsError);
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
      await loadGameById(first.contentId);
    } catch (e: any) {
      console.error("Fout bij laden spelslots:", e);
      setError("Het spel van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadGameById(gameId: string) {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();

      const { data: gameRows, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .limit(1);

      if (gameError) {
        console.error("Fout games:", gameError);
        throw gameError;
      }

      const game = gameRows && gameRows.length > 0 ? (gameRows[0] as any) : null;
      if (!game) {
        setState("empty");
        return;
      }

      const meta: GameMeta = {
        id: String(game.id),
        title: game.title || game.name || "Spel van vandaag",
        intro: game.intro_text || game.description || null,
        game_type: game.game_type || game.type || null,
        instructions: game.instructions || game.rules || null,
      };

      setMeta(meta);
      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden spel:", e);
      setError("Het spel van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  async function loadUserAndRating(gameId: string) {
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
        .from("game_ratings")
        .select("rating")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .limit(1);

      if (ratingFetchError) throw ratingFetchError;

      const row = ratingRows && ratingRows.length > 0 ? ratingRows[0] : null;
      setOwnRating(row ? (row as any).rating : null);
      setRatingLoading(false);
    } catch (e: any) {
      console.error("Fout bij laden beoordeling spel:", e);
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
        window.location.href = "/auth/login?redirect=/game";
        return;
      }

      const { error: upsertError } = await supabase.from("game_ratings").upsert({
        user_id: user.id,
        game_id: meta.id,
        rating: value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      setUserId(user.id);
      setOwnRating(value);
    } catch (e: any) {
      console.error("Fout bij opslaan beoordeling spel:", e);
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
              ? "Gratis spel van vandaag"
              : `Premium spel ${slot.slotIndex - 1}`;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => {
                setSelectedSlotIndex(slot.slotIndex);
                void loadGameById(slot.contentId);
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
              Spel
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Spel van vandaag"}
            </h1>
            {meta?.game_type && (
              <p className="mt-1 text-xs text-slate-400">
                Speltype: {meta.game_type}
              </p>
            )}

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
                    Maak een gratis profiel aan om spellen te beoordelen.
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
            Het spel van vandaag wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van het spel."}
          </div>
        )}

        {state === "empty" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Er is voor vandaag nog geen spel ingepland in het dagprogramma. Voeg in het CRM een spel
            toe aan <code>dayprogram_slots</code> (type <code>game</code>) om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && (
          <div className="space-y-4 rounded-3xl bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
            {meta?.intro && (
              <p className="whitespace-pre-line">{meta.intro}</p>
            )}
            {meta?.instructions && (
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <h2 className="text-sm font-semibold text-slate-50">
                  Speluitleg
                </h2>
                <p className="mt-2 whitespace-pre-line text-slate-200">
                  {meta.instructions}
                </p>
              </div>
            )}
            {!meta?.instructions && (
              <p className="text-slate-400">
                Voor dit spel is nog geen interactieve spel-ervaring ingericht. In een volgende fase
                voegen we hier het eerste werkende speltype toe (bijvoorbeeld: welk werk hoort bij
                deze beschrijving?).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
