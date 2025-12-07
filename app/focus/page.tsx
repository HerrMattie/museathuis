"use client";

import React from "react";

type RatingValue = 1 | 2 | 3 | 4 | 5;

interface RatingStarsProps {
  value: RatingValue | null;
  onChange?: (value: RatingValue) => void;
  disabled?: boolean;
}

export function RatingStars({ value, onChange, disabled }: RatingStarsProps) {
  const handleClick = (v: RatingValue) => {
    if (disabled || !onChange) return;
    onChange(v);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-slate-200">Uw beoordeling</div>
      {[1, 2, 3, 4, 5].map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => handleClick(v as RatingValue)}
            className={[
              "h-8 w-8 rounded-full text-xs font-semibold border transition-colors",
              active
                ? "bg-amber-400 border-amber-300 text-slate-900"
                : "bg-slate-900 border-slate-600 text-slate-200 hover:bg-slate-800",
              disabled
                ? "opacity-50 cursor-not-allowed hover:bg-slate-900"
                : "",
            ].join(" ")}
          >
            {v}
          </button>
        );
      })}
      {value && (
        <span className="text-xs text-slate-400">( {value}/5 )</span>
      )}
    </div>
  );
}
