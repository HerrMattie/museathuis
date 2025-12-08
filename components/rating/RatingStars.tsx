"use client";

import { useEffect, useState } from "react";

type RatingStarsProps = {
  /** Voor automatische opslag (tour/game/focus/best-of) */
  contentType?: string;          // bv. "tour" | "game" | "focus"
  contentId?: string;

  /** Gecontroleerd gebruik (bv. game-page) */
  value?: number | null;
  onChange?: (value: number) => void;

  /** Startwaarde als er al een gemiddelde rating is (best-of) */
  initialRating?: number | null;

  /** Algemene opties */
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

export default function RatingStars({
  contentType,
  contentId,
  value,
  onChange,
  initialRating = null,
  disabled = false,
  label,
  size = "md",
  className = "",
}: RatingStarsProps) {
  const [internalValue, setInternalValue] = useState<number | null>(
    value ?? initialRating
  );

  // Houd interne state in sync met externe value / initialRating
  useEffect(() => {
    if (typeof value === "number" || value === null) {
      setInternalValue(value);
    } else if (typeof initialRating === "number") {
      setInternalValue(initialRating);
    }
  }, [value, initialRating]);

  const effectiveValue = value ?? internalValue;

  async function sendRatingToServer(rating: number) {
    if (!contentType || !contentId) return;

    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, rating }),
      });
    } catch {
      // Geen harde fout tonen in de UI
    }
  }

  async function handleClick(star: number) {
    if (disabled) return;

    // Gecontroleerd gebruik: caller regelt opslag
    if (onChange) {
      onChange(star);
      return;
    }

    // Zelf-afhandelend gebruik: zelf opslaan
    setInternalValue(star);
    await sendRatingToServer(star);
  }

  const sizeClass = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="text-xs font-medium text-slate-300">{label}</div>
      )}

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (effectiveValue ?? 0) >= star;
          const base =
            "transition-colors cursor-pointer select-none";
          const stateClass = active ? "text-yellow-300" : "text-slate-600";
          const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(star)}
              className={`${sizeClass} ${base} ${stateClass} ${disabledClass}`}
              aria-label={`Geef ${star} van 5 sterren`}
            >
              ★
            </button>
          );
        })}

        {typeof effectiveValue === "number" && (
          <span className="ml-2 text-xs text-slate-400">
            ({effectiveValue}/5)
          </span>
        )}
      </div>
    </div>
  );
}
