"use client";

type RatingStarsProps = {
  value: number | null;
  onChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

export function RatingStars({ value, onChange, disabled, label }: RatingStarsProps) {
  const current = typeof value === "number" ? value : 0;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-[11px] font-medium text-slate-300">
          {label}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= current;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled || !onChange}
              onClick={() => onChange && onChange(star)}
              className={[
                "h-6 w-6 rounded-full text-xs",
                filled ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400",
                disabled || !onChange ? "cursor-default opacity-60" : "hover:bg-amber-300 hover:text-slate-950"
              ].join(" ")}
              aria-label={`Geef ${star} sterren`}
            >
              {star}
            </button>
          );
        })}
      </div>
      {typeof value === "number" && (
        <span className="text-[11px] text-slate-400">({value}/5)</span>
      )}
    </div>
  );
}
