"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

export type RatingValue = 1 | 2 | 3 | 4 | 5;
export type RatingState = RatingValue | null;

interface UseItemRatingOptions {
  tableName: string;          // "tour_ratings", "game_ratings", "focus_ratings"
  itemColumn: string;         // "tour_id", "game_id", "focus_item_id"
  itemId: string | null;      // gekoppeld item
}

interface SetRatingResult {
  ok: boolean;
  reason?: "not-allowed" | "error";
  message?: string;
}

interface UseItemRatingResult {
  rating: RatingState;
  canRate: boolean;
  saving: boolean;
  error: string | null;
  setRating: (value: RatingValue) => Promise<SetRatingResult>;
}

/**
 * Generieke hook om ratings op te halen en op te slaan.
 * Logica:
 * - Alleen ingelogde gebruikers kunnen raten.
 * - Maximaal 1 rating per user per item (upsert).
 */
export function useItemRating(
  options: UseItemRatingOptions
): UseItemRatingResult {
  const { tableName, itemColumn, itemId } = options;

  const [rating, setRatingState] = useState<RatingState>(null);
  const [canRate, setCanRate] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Bepaal of user kan raten en haal bestaande rating op
  useEffect(() => {
    let cancelled = false;

    async function loadRating() {
      try {
        setError(null);
        setRatingState(null);
        setCanRate(false);

        if (!itemId) {
          return;
        }

        const supabase = supabaseBrowser();

        // Haal sessie / user op
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Fout bij ophalen sessie:", sessionError);
          if (!cancelled) {
            setError("Kon je sessie niet ophalen.");
          }
          return;
        }

        const user = session?.user ?? null;
        const userId = user?.id ?? null;

        if (!userId) {
          if (!cancelled) {
            setCanRate(false);
            setRatingState(null);
          }
          return;
        }

        if (!cancelled) {
          setCanRate(true);
        }

        // Haal bestaande rating op
        const supabaseQuery = (supabase.from(tableName) as any)
          .select("rating")
          .eq("user_id", userId)
          .eq(itemColumn, itemId)
          .maybeSingle();

        const { data, error: ratingError }: { data: any; error: any } =
          await supabaseQuery;

        if (ratingError) {
          console.error("Fout bij ophalen rating:", ratingError);
          if (!cancelled) {
            setError("Kon je beoordeling niet ophalen.");
          }
          return;
        }

        if (!cancelled) {
          const initialRating: RatingState =
            data && typeof data.rating === "number"
              ? (data.rating as RatingValue)
              : null;
          setRatingState(initialRating);
        }
      } catch (e: any) {
        console.error("Onverwachte fout in useItemRating:", e);
        if (!cancelled) {
          setError("Onverwachte fout bij het ophalen van je beoordeling.");
        }
      }
    }

    loadRating();

    return () => {
      cancelled = true;
    };
  }, [tableName, itemColumn, itemId]);

  // Nieuwe rating opslaan
  const setRating = async (value: RatingValue): Promise<SetRatingResult> => {
    try {
      setError(null);

      const supabase = supabaseBrowser();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;
      const userId = user?.id ?? null;

      if (sessionError || !userId) {
        console.warn("Geen ingelogde gebruiker; rating niet toegestaan.");
        return {
          ok: false,
          reason: "not-allowed",
          message:
            "Je moet ingelogd zijn met een (gratis) profiel om te kunnen beoordelen.",
        };
      }

      if (!itemId) {
        return {
          ok: false,
          reason: "error",
          message: "Er is geen item gekoppeld aan dit slot.",
        };
      }

      setSaving(true);

      const payload: Record<string, any> = {
        user_id: userId,
        rating: value,
        rated_at: new Date().toISOString(),
      };
      payload[itemColumn] = itemId;

      // Upsert om max 1 rating per user/item te garanderen
      const query = (supabase.from(tableName) as any)
        .upsert(payload as any, {
          onConflict: `user_id,${itemColumn}`,
        })
        .select("rating")
        .single();

      const { data, error: upsertError }: { data: any; error: any } =
        await query;

      if (upsertError) {
        console.error("Fout bij opslaan rating:", upsertError);
        setError("Er ging iets mis bij het opslaan van je beoordeling.");
        setSaving(false);
        return {
          ok: false,
          reason: "error",
          message: upsertError.message ?? "Fout bij opslaan rating.",
        };
      }

      const stored: RatingState =
        data && typeof data.rating === "number"
          ? (data.rating as RatingValue)
          : value;

      setRatingState(stored);
      setSaving(false);

      return { ok: true };
    } catch (e: any) {
      console.error("Onverwachte fout bij setRating:", e);
      setError("Onverwachte fout bij het opslaan van je beoordeling.");
      setSaving(false);
      return {
        ok: false,
        reason: "error",
        message: e?.message ?? "Onverwachte fout.",
      };
    }
  };

  return {
    rating,
    canRate,
    saving,
    error,
    setRating,
  };
}
