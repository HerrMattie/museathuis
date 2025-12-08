import { useState } from "react";

type UseRatingOptions = {
  initialRating?: number;
  contentType: string;
  contentId: string;
};

export function useRating(options: UseRatingOptions) {
  const [rating, setRating] = useState<number | null>(
    typeof options.initialRating === "number" ? options.initialRating : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRating(value: number) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_type: options.contentType,
          content_id: options.contentId,
          rating: value,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.status !== "ok") {
        setError(json.error ?? "Er ging iets mis bij het opslaan van je beoordeling.");
        return;
      }

      setRating(json.rating);
    } catch (e: any) {
      setError(e?.message ?? "Er ging iets mis bij het opslaan van je beoordeling.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    rating,
    isSubmitting,
    error,
    submitRating,
  };
}