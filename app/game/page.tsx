"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { RatingStars } from "@/components/RatingStars";

type GameMeta = {
  id: string;
  title: string;
};

type LoadState = "idle" | "loading" | "loaded" | "error" | "empty";

export default function GameTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<GameMeta | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [ownRating, setOwnRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  useEffect(() => {
    void loadTodayGame();
  }, []);

  useEffect(() => {
    if (!meta) return;
    void loadUserAndRating(meta.id);
  }, [meta?.id]);

  async function loadTodayGame() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      const { data: scheduleRows, error: scheduleError } = await supabase
        .from("dayprogram_schedule")
        .select("game_id")
        .eq("day_date", today)
        .limit(1);

      if (scheduleError) throw scheduleError;

      const gameId = scheduleRows && scheduleRows.length > 0 ? scheduleRows[0].game_id : null;

      if (!gameId) {
        setState("empty");
        return;
      }

      const { data: gameRows, error: gameError } = await supabase
        .from("games")
        .select("id, title")
        .eq("id", gameId)
        .limit(1);

      if (gameError) throw gameError;

      const game = gameRows && gameRows.length > 0 ? gameRows[0] : null;
      if (!game) {
        setState("empty");
        return;
      }

      setMeta({ id: String(game.id), title: game.title ?? "Spel van vandaag" });
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
      setOwnRating(row ? row.rating : null);
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

      const { error: upsertError } = await supabase
        .from("game_ratings")
        .upsert({
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Spellen
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Spel van vandaag"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              In deze fase tonen we hier alvast de spel-titel van vandaag uit het dagprogramma.
              De inhoudelijke spelvorm werkt u stap voor stap verder uit.
            </p>

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
          </div>
          <div className="text-xs text-slate-400">
            <Link href="/" className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900">
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
            Er is voor vandaag nog geen spel ingepland in het dagprogramma. Voeg in het CRM een
            spel toe aan de tabel <code>dayprogram_schedule</code> om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && meta && (
          <div className="rounded-3xl bg-slate-900/80 p-8 text-sm text-slate-200">
            <p>
              Hier komt de eerste spelvariant (bijvoorbeeld een meerkeuzequiz gekoppeld aan concrete
              kunstwerken). U heeft nu in ieder geval een stabiele koppeling tussen dagprogramma en
              het publieksscherm voor spellen. De beoordelingen van gebruikers worden al opgeslagen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
