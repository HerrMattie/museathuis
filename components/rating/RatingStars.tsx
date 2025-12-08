"use client";

import { useRating } from "@/hooks/useRating";

type RatingStarsProps = {
  contentType: string;
  contentId: string;
  initialRating?: number;
};

export function RatingStars(props: RatingStarsProps) {
  const { rating, isSubmitting, error, submitRating } = useRating({
    contentType: props.contentType,
    contentId: props.contentId,
    initialRating: props.initialRating,
  });

  function handleClick(value: number) {
    if (isSubmitting) return;
    submitRating(value);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = rating != null && rating >= value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              className={
                "text-2xl" + (active ? " text-yellow-500" : " text-gray-400")
              }
              aria-label={
                "Geef " + value + " " + (value === 1 ? "ster" : "sterren")
              }
            >
              {active ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      {isSubmitting && (
        <p className="text-xs text-gray-500">Beoordeling wordt opgeslagen...</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}