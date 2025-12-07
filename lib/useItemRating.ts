"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type RatingState = 1 | 2 | 3 | 4 | 5 | null;

interface UseItemRatingOptions {
  tableName: "tour_ratings" | "game_ratings" | "focus_ratings";
  itemColumn: "tour_id" | "game_id" | "focus_item_id";
  itemId: string | null;
}

/**
 * Haalt de rating van de ingelogde gebruiker op voor één item
 * en zorgt dat insert/update altijd per (user_id, item_id) gebeurt.
 */
export function useItemRating({ tableName, itemColumn, itemId }: UseItemRatingOptions) {
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRatingState] = useState<RatingState>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ophalen bestaande rating zodra itemId verandert
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setRatingState(null);

        if (!itemId) {
          setLoading(false);
          return;
        }

        const supabase = supabaseBrowser();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user ?? null;

        if (!user) {
          if (!cancelled) {
            setUserId(null);
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        setUserId(user.id);

        const { data, error } = await supabase
          .from(tableName)
          .select("rating")
          .eq(itemColumn, itemId)
          .eq("user_id", user.id)
          .maybeSingle();

        // PGRST116 = no rows; dat is geen fout
        if (error && (error as any).code !== "PGRST116") {
          throw error;
        }

        if (!cancelled) {
          setRatingState((data?.rating as RatingState) ?? null);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error(e);
          setError(e.message ?? "Het ophalen van uw beoordeling is niet gelukt.");
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [tableName, itemColumn, itemId]);

  async function setRating(newRating: RatingState) {
    if (!itemId || !userId || !newRating) {
      // Niet ingelogd of geen itemId
      return { ok: false as const, reason: "not-allowed" as const };
    }

    try {
      setSaving(true);
      setError(null);
      const supabase = supabaseBrowser();

      const { data: existing, error: fetchError } = await supabase
        .from(tableName)
        .select("rating")
        .eq(itemColumn, itemId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError && (fetchError as any).code !== "PGRST116") {
        throw fetchError;
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ rating: newRating })
          .eq(itemColumn, itemId)
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        const payload: any = {
          rating: newRating,
          user_id: userId,
        };
        payload[itemColumn] = itemId;

        const { error: insertError } = await supabase
          .from(tableName)
          .insert(payload);

        if (insertError) throw insertError;
      }

      setRatingState(newRating);
      setSaving(false);
      return { ok: true as const };
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Het opslaan van uw beoordeling is niet gelukt.");
      setSaving(false);
      return { ok: false as const, reason: "error" as const };
    }
  }

  return {
    rating,
    loading,
    saving,
    error,
    canRate: !!userId && !!itemId,
    setRating,
  };
}
