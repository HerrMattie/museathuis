"use client";

import { useRating } from "@/hooks/useRating";

type RatingStarsProps = {
  contentType: string;
  contentId: string;
  initialRating?: number;
  size?: "sm" | "md" | "lg";
};

const sizeClassMap: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function RatingStars(props: RatingStarsProps) {
  const { rating, isSubmitting, error, submitRating } = useRating({
    contentType: props.contentType,
    contentId: props.contentId,
    initialRating: props.initialRating,
  });

  const sizeClass = sizeClassMap[props.size ?? "md"];

  function handleClick(value: number) {
    if (isSubmitting) return;
    submitRating(value);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-[#111827]">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = rating != null && rating >= value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              className={
                "relative inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors " +
                (active
                  ? "bg-yellow-400 text-black"
                  : "bg-transparent text-yellow-500 hover:bg-yellow-500/20")
              }
              aria-label={
                "Geef " + value + " " + (value === 1 ? "ster" : "sterren")
              }
            >
              <span className={sizeClass}>
                {active ? "★" : "☆"}
              </span>
            </button>
          );
        })}
      </div>
      {isSubmitting && (
        <p className="text-xs text-gray-400">Beoordeling wordt opgeslagen...</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}