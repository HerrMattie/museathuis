"use client";

import { useEffect, useState } from "react";

type RatingStarsProps = {
  /** Voor tour / game / focus als de component zelf de rating naar de API moet sturen */
  contentType?: "tour" | "game" | "focus";
  contentId?: string;

  /** Voor gecontroleerd gebruik (zoals in app/game/page.tsx) */
  value?: number | null;
  onChange?: (value: number) => void;

  /** Algemene opties */
  disabled?: boolean;
  label?: string;
};

export default function RatingStars({
  contentType,
  contentId,
  value,
  onChange,
  disabled = false,
  label,
}: RatingStarsProps) {
  const [internalValue, setInternalValue] = useState<number | null>(null);
  const effectiveValue = value ?? internalValue;

  useEffect(() => {
    if (typeof value === "number" || value === null) {
      setInternalValue(value);
    }
  }, [value]);

  async function sendRatingToServer(rating: number) {
    if (!contentType || !contentId) return;

    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, rating }),
      });
    } catch {
      // Geen hard error in de UI
    }
  }

  async function handleClick(star: number) {
    if (disabled) return;

    // Gecontroleerd gebruik (game)
    if (onChange) {
      onChange(star);
      return;
    }

    // Zelf-afhandelend gebruik (tour/focus/best-of)
    setInternalValue(star);
    await sendRatingToServer(star);
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="text-xs font-medium text-slate-300">{label}</div>
      )}

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = (effectiveValue ?? 0) >= star;
          const base =
            "text-xl transition-colors cursor-pointer select-none";
          const stateClass = active ? "text-yellow-300" : "text-slate-600";
          const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(star)}
              className={`${base} ${stateClass} ${disabledClass}`}
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
